# Standard Tasks (Single execution / CI)

run:
    cargo run --bin beacon

build:
    cargo build

check:
    cargo check

clean:
    cargo clean

test:
    cargo test

add-pkg crate feature="":
    cargo add {{crate}} {{ if feature != "" { "--features " + feature } else { "" } }}

# Compose run
compose-up-dev:
    docker compose -f docker-compose.dev.yml up --build

compose-up-prod:
    docker compose -f docker-compose.yml up --build -d

compose-down-dev:
    docker compose -f docker-compose.dev.yml down

compose-down-prod:
    docker compose -f docker-compose.yml down
