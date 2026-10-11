use crate::global::types;
use serde::Serialize;
use serde_json::Value;

#[derive(Debug, Serialize)]
pub struct Image {
    pub id: String,
    pub name: String,
    pub tag: Option<String>,
    pub architecture: String,
    pub os: String,
    pub local_digest: String,
    pub size: u64,
}

impl Image {
    pub fn from_json(json: &Value) -> Self {
        return Image {
            id: json["Id"].as_str().unwrap_or("").to_string(),
            name: json["Image"].as_str().unwrap_or("").to_string(),
            tag: Some(json["Tag"].as_str().unwrap_or("").to_string()),
            architecture: json["Architecture"].as_str().unwrap_or("").to_string(),
            os: json["Os"].as_str().unwrap_or("").to_string(),
            local_digest: json["Digest"].as_str().unwrap().to_string(),
            size: json["Size"].as_u64().unwrap_or(0),
        };
    }

    pub fn to_json(&self) -> Value {
        return serde_json::json!({
            "id":self.id,
            "name": self.name,
            "tag": self.tag,
            "architecture":self.architecture,
            "os": self.os,
            "local_digest": self.local_digest,
            "size": self.size
        });
    }
}

pub struct ImageCheckResult {
    pub id: String,
    pub status: types::ImageStatus,
    pub checked_at: tokio::time::Duration,
}
