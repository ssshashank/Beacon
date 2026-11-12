use beacon::bootstrap::{app, server};

#[tokio::main]
async fn main() {
    let (app, shutdown) = app::build_app();
    server::run(app, shutdown).await;
}
