use serde_json::{Value, json};
use std::collections::HashMap;

pub fn image_mapper(json: &Value) -> Value {
    let repo_tags: Vec<String> = json
        .get("RepoTags")
        .and_then(Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    let repo_digests: Vec<String> = json
        .get("RepoDigests")
        .and_then(Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    // Direct extraction: name & digest from RepoDigests, tag from RepoTags
    let (name, digest) = repo_digests
        .first()
        .and_then(|rd| rd.split_once('@'))
        .map(|(n, d)| (n.to_string(), d.to_string()))
        .unwrap_or_else(|| {
            let n = repo_tags
                .first()
                .and_then(|rt| rt.split_once(':'))
                .map(|(n, _)| n)
                .unwrap_or("<none>");
            (n.to_string(), json["Id"].as_str().unwrap_or("").to_string())
        });

    let tag = repo_tags
        .first()
        .and_then(|rt| rt.rsplit_once(':'))
        .map(|(_, t)| t.to_string())
        .unwrap_or_else(|| "latest".to_string());

    let size = json.get("Size").and_then(Value::as_u64).unwrap_or(0);
    let created = json.get("Created").and_then(Value::as_i64);
    let containers = json.get("Containers").and_then(Value::as_i64).unwrap_or(-1);

    let mut labels = HashMap::new();
    if let Some(obj) = json.get("Labels").and_then(Value::as_object) {
        for (k, v) in obj {
            if let Some(s) = v.as_str() {
                labels.insert(k.clone(), s.to_string());
            }
        }
    }

    let architecture = json["Descriptor"]["platform"]["architecture"]
        .as_str()
        .or_else(|| json["Architecture"].as_str())
        .unwrap_or("")
        .to_string();

    let os = json["Descriptor"]["platform"]["os"]
        .as_str()
        .or_else(|| json["Os"].as_str())
        .unwrap_or("")
        .to_string();

    let id = json["Id"]
        .as_str()
        .unwrap_or("")
        .split(":")
        .nth(1)
        .unwrap_or("");

    json!({
        "Id": id,
        "Name": name,
        "Tag": tag,
        "Architecture": architecture,
        "Os": os,
        "Digest": digest,
        "Size": size,
        "Created": created,
        "RepoTags": repo_tags,
        "RepoDigests": repo_digests,
        "Containers": containers,
        "Labels": labels,
    })
}
