use crate::global::types::{self, ContainerStatus};
use serde_json::{Value, json};
use std::collections::HashMap;

fn image_mapper(json: &Value) -> Value {
    json!({
        "Id": json["ImageID"].as_str().unwrap_or("").to_string(),
        "Image": json["Image"].as_str().unwrap_or("").to_string(),
        "Tag": "",
        "Architecture": json["ImageManifestDescriptor"]["platform"]["architecture"].as_str().unwrap_or("").to_string(),
        "Os": json["ImageManifestDescriptor"]["platform"]["os"].as_str().unwrap_or("").to_string(),
        "Digest": json["ImageManifestDescriptor"]["digest"].as_str().unwrap_or("").to_string(),
        "Size": json["ImageManifestDescriptor"]["size"].as_str().unwrap_or("").to_string(),
    })
}

pub fn map_container_status(state: &Value) -> ContainerStatus {
    let status = match state.as_str().unwrap_or("") {
        "running" => types::ContainerStatus::Running,
        "created" => types::ContainerStatus::Created,
        "restarting" => types::ContainerStatus::Restarting,
        "removing" => types::ContainerStatus::Removing,
        "paused" => types::ContainerStatus::Paused,
        "exited" => types::ContainerStatus::Exited,
        "dead" => types::ContainerStatus::Dead,
        _ => types::ContainerStatus::Unknown,
    };

    status
}

pub fn get_container_labels(labels: &Value) -> HashMap<String, String> {
    let mut container_labels = HashMap::new();
    if let Some(obj) = labels.as_object() {
        for (k, v) in obj {
            if let Some(val_str) = v.as_str() {
                container_labels.insert(k.clone(), val_str.to_string());
            }
        }
    }

    container_labels
}

pub fn list_container_mapper(json: &Value) -> Value {
    let image_res = image_mapper(json);

    let mut ports: Vec<Value> = Vec::new();
    if let Some(arr) = json.get("Ports").and_then(Value::as_array) {
        for p in arr {
            ports.push(json!({
                "host_ip": p.get("IP").and_then(Value::as_str),
                "host_port": p.get("PublicPort").map(|v| v.to_string()),
                "container_port": p.get("PrivatePort").map(|v| v.to_string()).unwrap_or_default(),
                "protocol": p.get("Type").and_then(Value::as_str).unwrap_or("tcp"),
            }));
        }
    }

    let mut mounts: Vec<Value> = Vec::new();
    if let Some(arr) = json.get("Mounts").and_then(Value::as_array) {
        for m in arr {
            mounts.push(json!({
                "source": m.get("Source").and_then(Value::as_str).unwrap_or(""),
                "destination": m.get("Destination").and_then(Value::as_str).unwrap_or(""),
                "type": m.get("Type").and_then(Value::as_str).unwrap_or(""),
                "mode": m.get("Mode").and_then(Value::as_str).unwrap_or(""),
                "rw": m.get("RW").and_then(Value::as_bool).unwrap_or(true),
            }));
        }
    }

    json!({
        "id": json["Id"],
        "host_id": null,
        "group_id": null,
        "volume": null,
        "updated_at": null,
        "deleted_at": null,
        "image_id": json["ImageID"],
        "image": image_res,
        "command": json["Command"],
        "names": json["Names"][0],
        "up_status": json["Status"],
        "status": json["State"],
        "labels": (&json["Labels"]),
        "created_at": json["Created"],
        "ports": ports,
        "mounts": mounts,
    })
}

pub fn inspect_container_mapper(json: &Value) -> Value {
    let image_res = image_mapper(json);

    let mut ports: Vec<Value> = Vec::new();
    let ports_obj = json
        .get("NetworkSettings")
        .and_then(|ns| ns.get("Ports"))
        .or_else(|| json.get("HostConfig").and_then(|hc| hc.get("PortBindings")));

    if let Some(obj) = ports_obj.and_then(Value::as_object) {
        for (port_proto, bindings) in obj {
            let mut parts = port_proto.split('/');
            let container_port = parts.next().unwrap_or("").to_string();
            let protocol = parts.next().unwrap_or("tcp").to_string();

            if let Some(arr) = bindings.as_array() {
                if arr.is_empty() {
                    ports.push(json!({
                        "host_ip": null,
                        "host_port": null,
                        "container_port": container_port,
                        "protocol": protocol,
                    }));
                } else {
                    for b in arr {
                        ports.push(json!({
                            "host_ip": b.get("HostIp").and_then(Value::as_str),
                            "host_port": b.get("HostPort").and_then(Value::as_str),
                            "container_port": container_port.clone(),
                            "protocol": protocol.clone(),
                        }));
                    }
                }
            } else {
                ports.push(json!({
                    "host_ip": null,
                    "host_port": null,
                    "container_port": container_port,
                    "protocol": protocol,
                }));
            }
        }
    }

    let mut mounts: Vec<Value> = Vec::new();
    if let Some(arr) = json.get("Mounts").and_then(Value::as_array) {
        for m in arr {
            mounts.push(json!({
                "source": m.get("Source").and_then(Value::as_str).unwrap_or(""),
                "destination": m.get("Destination").and_then(Value::as_str).unwrap_or(""),
                "type": m.get("Type").and_then(Value::as_str).unwrap_or(""),
                "mode": m.get("Mode").and_then(Value::as_str).unwrap_or(""),
                "rw": m.get("RW").and_then(Value::as_bool).unwrap_or(true),
            }));
        }
    } else if let Some(binds) = json
        .get("HostConfig")
        .and_then(|hc| hc.get("Binds"))
        .and_then(Value::as_array)
    {
        for b in binds {
            if let Some(s) = b.as_str() {
                let parts: Vec<&str> = s.split(':').collect();
                if parts.len() >= 2 {
                    mounts.push(json!({
                        "source": parts[0],
                        "destination": parts[1],
                        "type": "bind",
                        "mode": parts.get(2).unwrap_or(&"rw"),
                        "rw": parts.get(2).map_or(true, |m| *m != "ro"),
                    }));
                }
            }
        }
    }

    json!({
        "id": json["Id"],
        "host_id": null,
        "group_id": null,
        "volume": null,
        "updated_at": null,
        "deleted_at": null,
        "image_id": json["Image"],
        "image": image_res,
        "tty": json["Config"]["Tty"],
        "command": json["Config"]["Entrypoint"]
            .as_array()
            .map(|arr| {
                arr.iter()
                    .filter_map(|val| val.as_str())
                    .collect::<Vec<&str>>()
                    .join(" ") })
                .unwrap_or_default(),
        "names": json["Name"],
        "up_status": json["State"]["StartedAt"],
        "status": json["State"]["Status"],
        "labels": (&json["Config"]["Labels"]),
        "created_at": json["Created"],
        "ports": ports,
        "mounts": mounts,
    })
}

pub fn container_process_mapper(titles: &[String], arr: &Value) -> Value {
    let get_col = |patterns: &[&str]| -> String {
        for pattern in patterns {
            if let Some(pos) = titles.iter().position(|t| t.eq_ignore_ascii_case(pattern)) {
                if let Some(val) = arr.get(pos).and_then(Value::as_str) {
                    return val.to_string();
                }
            }
        }
        "".to_string()
    };

    let user = get_col(&["UID", "USER"]);
    let pid = get_col(&["PID"]);
    let ppid = get_col(&["PPID"]);
    let cpu = get_col(&["%CPU", "C", "CPU"]);
    let start_time = get_col(&["STIME", "START"]);
    let tty = get_col(&["TTY"]);
    let time = get_col(&["TIME"]);
    let cmd = get_col(&["CMD", "COMMAND"]);

    // If titles didn't match (e.g. titles was empty), fallback to positional indexing if 8 cols
    if cmd.is_empty() && arr.as_array().map_or(false, |a| a.len() == 8) {
        return json!({
            "uid": arr.get(0).and_then(Value::as_str).unwrap_or(""),
            "pid": arr.get(1).and_then(Value::as_str).unwrap_or(""),
            "ppid": arr.get(2).and_then(Value::as_str).unwrap_or(""),
            "cpu": arr.get(3).and_then(Value::as_str).unwrap_or(""),
            "start_time": arr.get(4).and_then(Value::as_str).unwrap_or(""),
            "tty": arr.get(5).and_then(Value::as_str).unwrap_or(""),
            "time": arr.get(6).and_then(Value::as_str).unwrap_or(""),
            "command": arr.get(7).and_then(Value::as_str).unwrap_or("")
        });
    }

    json!({
        "uid": user,
        "pid": pid,
        "ppid": ppid,
        "cpu": cpu,
        "start_time": start_time,
        "tty": tty,
        "time": time,
        "command": cmd
    })
}
