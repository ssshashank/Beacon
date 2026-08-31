use reqwest::Client;

#[derive(Clone)]
pub struct AppConfig {
    pub client: Client,
}
