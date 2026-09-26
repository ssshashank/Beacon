use crate::global::config::{DOCKER_API_VERSION, HOST};
use serde_json::Value;
use std::error::Error;

pub async fn call_end_points(
    client: &reqwest::Client,
    url: &str,
    id: Option<&str>,
) -> Result<Value, Box<dyn Error>> {
    let path = match (id, url.find('{'), url.find('}')) {
        (Some(id), Some(start), Some(end)) => format!("{}{}{}", &url[..start], id, &url[end + 1..]),
        _ => url.to_string(),
    };
    let full_url = format!("http://{}/{}{}", *HOST, *DOCKER_API_VERSION, path);
    let response = client.get(full_url).send().await?;
    let json: Value = response.json().await?;
    Ok(json)
}
