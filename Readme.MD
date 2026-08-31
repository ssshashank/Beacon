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
just compose-up-dev
```

This builds `Dockerfile.dev`, mounts the Docker socket and live source directories, and runs the server with hot-reload via `entrypoint.dev.sh`.

## Available Tasks (`justfile`)

| Command | Description |
|---|---|
| `just run` | Run the server (`cargo run -p beacon`) |
| `just build` | Build the server |
| `just check` | Type-check the server |
| `just clean` | Clean cargo build artifacts |
| `just test` | Run server tests |
| `just add-pkg <crate> [feature]` | Add a dependency to the server crate |
| `just web-install` | Install web dependencies via Bun |
| `just web-dev` | Start the web dev server |
| `just web-build` | Build the web app for production |
| `just compose-up-dev` / `just compose-down-dev` | Start/stop the dev Docker Compose stack |
| `just compose-up-prod` / `just compose-down-prod` | Start/stop the production Docker Compose stack |

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

| Variable | Description | Default |
|---|---|---|
| `PROJECT_NAME` | Display name of the project | `Beacon` |
| `PORT` | Port the server listens on | `8000` |
| `HOST` | Host/interface the server binds to | `0.0.0.0` |

Environment files:
- `.env.default` — baseline example values
- `.env.dev` — used by `docker-compose.dev.yml`
- `.env` — local overrides (gitignored)

## Docker

Build and run in production mode:

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
