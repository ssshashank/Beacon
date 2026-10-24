use crate::{
    global::types,
    modules::{
        containers::mapper::{get_container_labels, map_container_status},
        images::dto::Image,
    },
};
use chrono::{DateTime, TimeZone, Utc};
use serde::Serialize;
use serde_json::{Value, json};
use std::collections::HashMap;

#[derive(Debug, Serialize)]
pub struct Process {
    pub user_type: String,
    pub pid: String,
    pub ppid: String,
    pub cpu_utilization: String,
    pub start_time: String,
    pub teletypewriter: String,
    pub cummulative_cpu_time: String,
    pub cmd: String,
}

impl Process {
    pub fn from_json(json: &Value) -> Process {
        return Process {
            user_type: json["uid"].as_str().unwrap_or("").to_string(),
            pid: json["pid"].as_str().unwrap_or("").to_string(),
            ppid: json["ppid"].as_str().unwrap_or("").to_string(),
            cpu_utilization: json["c"].as_str().unwrap_or("").to_string(),
            start_time: json["stime"].as_str().unwrap_or("").to_string(),
            teletypewriter: json["tty"].as_str().unwrap_or("").to_string(),
            cummulative_cpu_time: json["time"].as_str().unwrap_or("").to_string(),
            cmd: json["cmd"].as_str().unwrap_or("").to_string(),
        };
    }

    pub fn to_json(&self) -> Value {
        return json!({
            "user_type": self.user_type,
            "pid": self.pid,
            "ppid": self.ppid,
            "cpu_utilization": self.cpu_utilization,
            "start_time": self.start_time,
            "teletypewriter": self.teletypewriter,
            "cummulative_cpu_time": self.cummulative_cpu_time,
            "cmd": self.cmd
            }
        );
    }
}

#[derive(Debug, Serialize)]
pub struct Container {
    pub id: String,
    pub host_id: Option<String>,
    pub group_id: Option<String>,
    pub image_id: String,
    pub image: Image,
    pub name: String,
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
    // serialize from json to container
    pub fn from_json(json: &Value) -> Container {
        return Container {
            id: json["id"].as_str().unwrap_or("").to_string(),
            host_id: json["host_id"].as_str().map(String::from),
            group_id: json["group_id"].as_str().map(String::from),
            image_id: json["image_id"].as_str().unwrap_or("").to_string(),
            image: Image::from_json(&json["image"]),
            command: json["command"].as_str().unwrap_or("").to_string(),
            name: json["names"].as_str().unwrap_or("").to_string(),
            up_status: json["up_status"].as_str().unwrap_or("").to_string(),
            status: map_container_status(&json["status"]),
            volume: json["volume"].as_str().map(String::from),
            label: get_container_labels(&json["labels"]),
            created_at: Utc
                .timestamp_opt(json["created_at"].as_i64().unwrap_or(0), 0)
                .unwrap(),
            updated_at: json["updated_at"]
                .as_str()
                .and_then(|s| s.parse::<DateTime<Utc>>().ok()),
            deleted_at: json["deleted_at"]
                .as_str()
                .and_then(|s| s.parse::<DateTime<Utc>>().ok()),
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
