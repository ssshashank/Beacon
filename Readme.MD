# Beacon

Beacon is a lightweight Docker monitoring and management tool. A Rust (Axum) backend talks directly to the Docker Engine API over the Unix socket and exposes a clean REST/SSE interface, paired with a SolidJS web dashboard for browsing containers, images, and live Docker events.

## Features

- **Container insights** — list containers, inspect metadata, view running processes, tail logs, diff the filesystem, export a container, and pull live resource usage stats.
- **Live event stream** — subscribe to Docker's event feed over Server-Sent Events (SSE).
- **Image management** — Docker image endpoints (in progress).
- **Web dashboard** — a SolidJS single-page app for visualizing the above.

## Architecture

```
beacon/
├── apps/
│   ├── server/          # Rust (Axum) API server
│   │   └── src/
│   │       ├── bootstrap/   # app wiring, module registry, router assembly
│   │       ├── client/      # Docker socket client
│   │       ├── config/      # app configuration (reqwest client, etc.)
│   │       ├── global/      # shared config/docker/utils
│   │       └── modules/     # feature modules: containers, images, events
│   └── web/             # SolidJS + Vite frontend
├── docker-compose.yml       # production compose
├── docker-compose.dev.yml   # development compose (hot-reload via cargo run)
├── Dockerfile / Dockerfile.dev
└── justfile              # task runner (see below)
```

The server talks to Docker by mounting `/var/run/docker.sock` into the container and issuing HTTP requests over it via `reqwest`.

## Tech Stack

| Layer     | Technology                              |
|-----------|------------------------------------------|
| Backend   | Rust, [Axum](https://github.com/tokio-rs/axum), Tokio, reqwest |
| Frontend  | [SolidJS](https://www.solidjs.com/), Vite, TypeScript |
| Package manager (web) | [Bun](https://bun.sh/) |
| Task runner | [just](https://github.com/casey/just) |
| Containerization | Docker / Docker Compose |
| CI | GitHub Actions |

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (2024 edition toolchain)
- [Bun](https://bun.sh/) for the web app
- [just](https://github.com/casey/just) (optional, but recommended for the commands below)
- Docker, with access to `/var/run/docker.sock`

## Getting Started

### 1. Clone and configure

```bash
git clone <repo-url>
cd beacon
cp .env.default .env   # adjust PROJECT_NAME / PORT as needed
```

### 2. Run the API server

```bash
just run        # cargo run -p beacon
# or without just:
cargo run -p beacon
```

The server starts on the host/port defined in your `.env` file (defaults: `0.0.0.0:8000`).

### 3. Run the web dashboard

```bash
just web-install    # bun install
just web-dev         # cd apps/web && bun run dev
```

### 4. Run everything with Docker Compose (dev)

```bash
just dev-up
```

This builds `Dockerfile.dev` and `Dockerfile.web.dev`, mounts live source directories and Docker socket, and runs the stack with hot-reload.

## Available Tasks (`justfile`)

### Production Commands
| Command | Description |
|---|---|
| `just prod-up` | Start production single container in background (`just compose-up-prod`) |
| `just prod-down` | Stop production container (`just compose-down-prod`) |
| `just prod-logs` | Stream production container logs |
| `just prod-build` | Build production Docker image directly |
| `just prod-run` | Run production Docker container directly |

### Development Commands (Docker)
| Command | Description |
|---|---|
| `just dev-up` | Start full dev stack with hot-reload (`just compose-up-all`) |
| `just dev-down` | Stop dev stack (`just compose-down-dev`) |
| `just dev-logs` | Stream dev stack logs |
| `just dev-up-backend` | Start only backend dev container |
| `just dev-up-frontend` | Start only frontend dev container |

### Local Tasks (Without Docker)
| Command | Description |
|---|---|
| `just run` | Run server locally (`cargo run -p beacon`) |
| `just build` / `just build-release` | Build server |
| `just check` | Type-check server |
| `just test` | Run server tests |
| `just web-install` | Install web dependencies via Bun |
| `just web-dev` | Start web dev server (Vite on :3000) |
| `just web-build` | Build web frontend for production |

## API Overview

All routes are namespaced under `/api/v1`.

### Containers — `/api/v1/containers`

| Method | Path | Description |
|---|---|---|
| GET | `/getAllContainers` | List all containers |
| GET | `/inspectContainer/{id}` | Inspect a container by ID |
| GET | `/allProcessRunningInContainer/{id}` | List processes running inside a container |
| GET | `/getContainerLogs/{id}` | Fetch container logs |
| GET | `/getChangesOnContainerFileSystemById/{id}` | Get filesystem changes for a container |
| GET | `/exportContainerById/{id}` | Export a container's filesystem |
| GET | `/getContainerResourceUsageStatsById/{id}` | Get live resource usage stats |

### Events — `/api/v1/events`

| Method | Path | Description |
|---|---|---|
| GET | `/streamEvents` | Server-Sent Events stream of Docker events |

## Environment Variables

Beacon adopts a **zero-config** approach. All variables are optional with built-in defaults:

| Variable | Legacy Alias | Description | Default |
|---|---|---|---|
| `BEACON_PORT` | `PORT` | Port the server listens on | `8000` |
| `BEACON_HOST` | `HOST` | Host/interface the server binds to | `0.0.0.0` |
| `BEACON_DOCKER_SOCKET` | `UNIX_SOCKET_PATH` | Path to Docker Unix socket | `/var/run/docker.sock` |
| `BEACON_DOCKER_API_VERSION` | `DOCKER_API_VERSION` | Docker Engine API version | `v1.51` |
| `BEACON_WEB_DIR` | `WEB_DIR` | Static web assets directory | `apps/web/dist/client` |
| `BEACON_CORS_ORIGIN` | `CORS_ORIGIN_ALLOWED_ENDPOINT` | Allowed CORS origin (dev only) | `""` |

## Docker Deployment (Single Container)

### Run with Docker CLI (Single Container)

```bash
docker run -d --name beacon \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8000:8000 \
  beacon:latest
```

### Run with Docker Compose

```bash
docker compose -f docker-compose.yml up --build -d
```

Build and run in development mode (hot-reload, source mounted):

```bash
docker compose -f docker-compose.dev.yml up --build
```

Both compose files mount `/var/run/docker.sock` into the container so Beacon can talk to the host's Docker daemon.

## Testing & CI

```bash
just test
# or
cargo test -p beacon
```

GitHub Actions (`.github/workflows/rust.yml`) builds and tests the Rust workspace on every push and pull request to `main`.

## License

See [LICENSE](./LICENSE).
