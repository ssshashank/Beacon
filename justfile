# Standard Tasks (Single execution / CI)

run:
    cargo run -p beacon

build:
    cargo build -p beacon

check:
    cargo check -p beacon

clean:
    cargo clean

test:
    cargo test -p beacon

add-pkg crate feature="":
    cargo add {{crate}} -p beacon {{ if feature != "" { "--features " + feature } else { "" } }}

# Web (SolidJS)
web-install:
    bun install

web-dev:
    cd apps/web && bun run dev

web-build:
    cd apps/web && bun run build

# Compose run
compose-up-dev:
    docker compose -f docker-compose.dev.yml up --build

compose-up-prod:
    docker compose -f docker-compose.yml up --build -d

compose-down-dev:
    docker compose -f docker-compose.dev.yml down

compose-down-prod:
    docker compose -f docker-compose.yml down
