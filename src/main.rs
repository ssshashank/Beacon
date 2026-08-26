use beacon::bootstrap::{app, server};

#[tokio::main]
async fn main() {
    let app = app::build_app();
    server::run(app).await;
}
