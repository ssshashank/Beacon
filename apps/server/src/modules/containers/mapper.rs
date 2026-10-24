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
        "names": json["names"][0],
        "up_status": json["Status"],
        "status":json["State"],
        "labels": (&json["Labels"]),
        "created_at": json["Created"],
    })
}

pub fn inspect_container_mapper(json: &Value) -> Value {
    let image_res = image_mapper(json);

    json!({
        "id": json["Id"],
        "host_id": null,
        "group_id": null,
        "volume": null,
        "updated_at": null,
        "deleted_at": null,
        "image_id": json["Image"],
        "image": image_res,
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
        "status":json["State"]["Status"],
        "labels": (&json["Config"]["Labels"]),
        "created_at": json["Created"],
    })
}
