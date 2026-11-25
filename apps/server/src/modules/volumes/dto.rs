use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Volume {
    pub name: String,
    pub driver: String,
    pub mountpoint: String,
    pub created_at: Option<String>,
    pub scope: String,
    pub labels: HashMap<String, String>,
    pub options: Option<HashMap<String, String>>,
    pub size: Option<u64>,
    pub ref_count: Option<i64>,
}

impl Volume {
    pub fn from_json(json: &Value) -> Self {
        let name = json
            .get("Name")
            .or_else(|| json.get("name"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let driver = json
            .get("Driver")
            .or_else(|| json.get("driver"))
            .and_then(Value::as_str)
            .unwrap_or("local")
            .to_string();

        let mountpoint = json
            .get("Mountpoint")
            .or_else(|| json.get("mountpoint"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string();

        let created_at = json
            .get("CreatedAt")
            .or_else(|| json.get("created_at"))
            .and_then(Value::as_str)
            .map(String::from);

        let scope = json
            .get("Scope")
            .or_else(|| json.get("scope"))
            .and_then(Value::as_str)
            .unwrap_or("local")
            .to_string();

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

        let mut options = None;
        if let Some(obj) = json
            .get("Options")
            .or_else(|| json.get("options"))
            .and_then(Value::as_object)
        {
            let mut opts = HashMap::new();
            for (k, v) in obj {
                if let Some(s) = v.as_str() {
                    opts.insert(k.clone(), s.to_string());
                }
            }
            options = Some(opts);
        }

        let usage_data = json.get("UsageData").or_else(|| json.get("usage_data"));
        let size = usage_data
            .and_then(|u| u.get("Size"))
            .and_then(Value::as_u64);
        let ref_count = usage_data
            .and_then(|u| u.get("RefCount"))
            .and_then(Value::as_i64);

        Volume {
            name,
            driver,
            mountpoint,
            created_at,
            scope,
            labels,
            options,
            size,
            ref_count,
        }
    }

    pub fn to_json(&self) -> Value {
        serde_json::to_value(self).unwrap_or(Value::Null)
    }
}
