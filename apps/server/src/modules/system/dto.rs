use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemDf {
    pub layers_size: Option<u64>,
    pub images_count: Option<usize>,
    pub containers_count: Option<usize>,
    pub volumes_count: Option<usize>,
    pub build_cache_count: Option<usize>,
    pub raw: Value,
}

impl SystemDf {
    pub fn from_json(json: &Value) -> Self {
        let layers_size = json.get("LayersSize").and_then(Value::as_u64);
        let images_count = json
            .get("Images")
            .and_then(Value::as_array)
            .map(|a| a.len());
        let containers_count = json
            .get("Containers")
            .and_then(Value::as_array)
            .map(|a| a.len());
        let volumes_count = json
            .get("Volumes")
            .and_then(Value::as_array)
            .map(|a| a.len());
        let build_cache_count = json
            .get("BuildCache")
            .and_then(Value::as_array)
            .map(|a| a.len());

        Self {
            layers_size,
            images_count,
            containers_count,
            volumes_count,
            build_cache_count,
            raw: json.clone(),
        }
    }
}
