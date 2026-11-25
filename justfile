# Default task (prints available commands)
default:
    @just --list

# ==============================================================================
# Production (Single Container)
# ==============================================================================

# Start production single container in background
prod-up:
    docker compose -f docker-compose.yml up --build -d

# Stop production container
prod-down:
    docker compose -f docker-compose.yml down

# View production logs
prod-logs:
    docker compose -f docker-compose.yml logs -f

# Build production docker image directly
prod-build:
    docker build -t beacon:latest .

# Run production docker container directly
prod-run:
    docker run -d --name beacon -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock beacon:latest

# Aliases for backward compatibility
alias compose-up-prod := prod-up
alias compose-down-prod := prod-down

# ==============================================================================
# Development (Docker Stack with Hot-Reload)
# ==============================================================================

# Start full dev stack (Backend + Frontend with Hot-Reload)
dev-up:
    docker compose -f docker-compose.dev.yml up --build

# Start only dev backend container
dev-up-backend:
    docker compose -f docker-compose.dev.yml up beacon --build

# Start only dev frontend container
dev-up-frontend:
    docker compose -f docker-compose.dev.yml up web --build

# Stop dev stack
dev-down:
    docker compose -f docker-compose.dev.yml down

# View dev logs
dev-logs:
    docker compose -f docker-compose.dev.yml logs -f

# Aliases for backward compatibility
alias compose-up-dev := dev-up-backend
alias compose-up-dev-web := dev-up-frontend
alias compose-up-dev-all := dev-up
alias compose-up-all := dev-up
alias compose-down-dev := dev-down

# ==============================================================================
# Local Development (Host machine without Docker)
# ==============================================================================

# Run backend directly with Cargo
run:
    cargo run -p beacon

# Build backend
build:
    cargo build -p beacon

# Build backend in release mode
build-release:
    cargo build --release

# Type-check backend
check:
    cargo check -p beacon

# Clean cargo cache
clean:
    cargo clean

# Run backend tests
test:
    cargo test -p beacon

# Add package to backend
add-pkg crate feature="":
    cargo add {{crate}} -p beacon {{ if feature != "" { "--features " + feature } else { "" } }}

# Install web dependencies (Bun)
web-install:
    bun install

# Run web dev server directly with Vite (http://localhost:3000)
web-dev:
    cd apps/web && bun run dev

# Build web frontend for production (emits to apps/web/dist/client)
web-build:
    cd apps/web && bun run build
