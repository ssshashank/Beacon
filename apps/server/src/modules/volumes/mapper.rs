use serde_json::{Value, json};
use std::collections::HashMap;

pub fn volume_mapper(json: &Value) -> Value {
    let name = json
        .get("Name")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let driver = json
        .get("Driver")
        .and_then(Value::as_str)
        .unwrap_or("local")
        .to_string();

    let mountpoint = json
        .get("Mountpoint")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let created_at = json
        .get("CreatedAt")
        .and_then(Value::as_str)
        .map(String::from);

    let scope = json
        .get("Scope")
        .and_then(Value::as_str)
        .unwrap_or("local")
        .to_string();

    let mut labels = HashMap::new();
    if let Some(obj) = json.get("Labels").and_then(Value::as_object) {
        for (k, v) in obj {
            if let Some(s) = v.as_str() {
                labels.insert(k.clone(), s.to_string());
            }
        }
    }

    let mut options = None;
    if let Some(obj) = json.get("Options").and_then(Value::as_object) {
        let mut opts = HashMap::new();
        for (k, v) in obj {
            if let Some(s) = v.as_str() {
                opts.insert(k.clone(), s.to_string());
            }
        }
        options = Some(opts);
    }

    let usage_data = json.get("UsageData");
    let size = usage_data
        .and_then(|u| u.get("Size"))
        .and_then(Value::as_u64);
    let ref_count = usage_data
        .and_then(|u| u.get("RefCount"))
        .and_then(Value::as_i64);

    json!({
        "Name": name,
        "Driver": driver,
        "Mountpoint": mountpoint,
        "CreatedAt": created_at,
        "Scope": scope,
        "Labels": labels,
        "Options": options,
        "UsageData": {
            "Size": size,
            "RefCount": ref_count
        }
    })
}
