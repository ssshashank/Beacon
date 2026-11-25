use crate::global::types;
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Serialize, Clone)]
pub struct Image {
    pub id: String,
    pub name: String,
    pub tag: Option<String>,
    pub architecture: String,
    pub os: String,
    pub local_digest: Option<String>,
    pub size: u64,
    pub created: Option<i64>,
    pub repo_tags: Vec<String>,
    pub repo_digests: Vec<String>,
    pub containers: i64,
    pub labels: HashMap<String, String>,
}

impl Image {
    pub fn from_json(json: &Value) -> Self {
        let repo_tags: Vec<String> = json
            .get("RepoTags")
            .or_else(|| json.get("repo_tags"))
            .and_then(Value::as_array)
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect()
            })
            .unwrap_or_default();

        let repo_digests: Vec<String> = json
            .get("RepoDigests")
            .or_else(|| json.get("repo_digests"))
            .and_then(Value::as_array)
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(String::from))
                    .collect()
            })
            .unwrap_or_default();

        let mut labels = HashMap::new();
        if let Some(obj) = json
            .get("Labels")
            .or_else(|| json.get("labels"))
            .and_then(Value::as_object)
        {
            for (k, v) in obj {
                if let Some(s) = v.as_str() {
                    labels.insert(k.clone(), s.to_string());
                }
            }
        }

        let id = json
            .get("Id")
            .or_else(|| json.get("id"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let name = json
            .get("Name")
            .or_else(|| json.get("name"))
            .or_else(|| json.get("Image"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let tag = json
            .get("Tag")
            .or_else(|| json.get("tag"))
            .and_then(Value::as_str)
            .map(String::from);

        let architecture = json
            .get("Architecture")
            .or_else(|| json.get("architecture"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let os = json
            .get("Os")
            .or_else(|| json.get("os"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let local_digest = json
            .get("Digest")
            .or_else(|| json.get("local_digest"))
            .and_then(Value::as_str)
            .map(String::from);

        let size = json
            .get("Size")
            .or_else(|| json.get("size"))
            .and_then(Value::as_u64)
            .unwrap_or(0);

        let created = json
            .get("Created")
            .or_else(|| json.get("created"))
            .and_then(Value::as_i64);

        let containers = json
            .get("Containers")
            .or_else(|| json.get("containers"))
            .and_then(Value::as_i64)
            .unwrap_or(-1);

        Image {
            id,
            name,
            tag,
            architecture,
            os,
            local_digest,
            size,
            created,
            repo_tags,
            repo_digests,
            containers,
            labels,
        }
    }

    pub fn to_json(&self) -> Value {
        serde_json::to_value(self).unwrap_or(Value::Null)
    }
}

pub struct ImageCheckResult {
    pub id: String,
    pub status: types::ImageStatus,
    pub checked_at: tokio::time::Duration,
}
