use serde_json::{Value, json};

pub fn list_image_mapper(json: &Value) -> Value {
    json!({
        "id": json["id"].as_str().unwrap_or("").to_string(),
        "image": json["image"].as_str().unwrap_or("").to_string(),
        "tag": json["tag"],
        "architecture": json["architecture"].as_str().unwrap_or("").to_string(),
        "os": json["os"].as_str().unwrap_or("").to_string(),
        "digest": json["digest"].as_str().unwrap_or("").to_string(),
        "size": json["size"].as_u64().unwrap_or(0)
    })
}
