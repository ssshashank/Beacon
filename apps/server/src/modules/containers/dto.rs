use crate::{global::types, modules::images::dto::Image};
use chrono::{DateTime, TimeZone, Utc};
use serde::Serialize;
use serde_json::{Value, json};
use std::collections::HashMap;

#[derive(Debug, Serialize)]
pub struct Container {
    pub id: String,
    pub host_id: Option<String>,
    pub group_id: Option<String>,
    pub image_id: String,
    pub image: Image,
    pub name: Vec<String>,
    pub up_status: String,
    pub status: types::ContainerStatus,
    pub volume: Option<String>,
    pub label: HashMap<String, String>,
    pub command: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
}

impl Container {
    fn mapper(json: &Value) -> Value {
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

    // serialize from json to container
    pub fn from_json(json: &Value) -> Container {
        // mapping state and labels
        let status = match json["State"].as_str().unwrap_or("") {
            "running" => types::ContainerStatus::Running,
            "created" => types::ContainerStatus::Created,
            "restarting" => types::ContainerStatus::Restarting,
            "removing" => types::ContainerStatus::Removing,
            "paused" => types::ContainerStatus::Paused,
            "exited" => types::ContainerStatus::Exited,
            "dead" => types::ContainerStatus::Dead,
            _ => types::ContainerStatus::Unknown,
        };

        let mut labels = HashMap::new();
        if let Some(obj) = json["Labels"].as_object() {
            for (k, v) in obj {
                if let Some(val_str) = v.as_str() {
                    labels.insert(k.clone(), val_str.to_string());
                }
            }
        }

        // image mapper
        let res = Self::mapper(json);

        return Container {
            id: json["Id"].as_str().unwrap_or("").to_string(),
            host_id: None,
            group_id: None,
            image_id: json["ImageID"].as_str().unwrap_or("").to_string(),
            image: Image::from_json(&res),
            command: json["Command"].as_str().unwrap_or("").to_string(),
            name: json["Names"]
                .as_array()
                .map(|names| {
                    names
                        .iter()
                        .filter_map(|name| name.as_str().map(String::from))
                        .collect()
                })
                .unwrap_or_default(),
            up_status: json["Status"].as_str().unwrap_or("").to_string(),
            status: status,
            volume: None,
            label: labels,
            created_at: Utc
                .timestamp_opt(json["Created"].as_i64().unwrap_or(0), 0)
                .unwrap(),
            updated_at: None,
            deleted_at: None,
        };
    }

    // deserialize from Container struct to json
    pub fn to_json(&self) -> Value {
        return json!({
            "id": self.id,
            "host_id": self.host_id,
            "group_id": self.group_id,
            "image_id": self.image_id,
            "name": self.name,
            "image": self.image.to_json(),
            "up_status": self.up_status,
            "status": self.status,
            "volume": self.volume,
            "label": self.label,
            "commad": self.command,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "deleted_at": self.deleted_at
            }
        );
    }
}
