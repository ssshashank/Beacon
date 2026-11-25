<div align="center">

# Beacon ⚡

**A lightweight, high-performance Docker monitoring & management tool.**

[![Website](https://img.shields.io/badge/Website-beacon--logs.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://beacon-logs.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.97+-DEA584?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![SolidJS](https://img.shields.io/badge/SolidJS-2.0-2C4F7C?style=for-the-badge&logo=solid&logoColor=white)](https://www.solidjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  <a href="https://beacon-logs.vercel.app/"><strong>Explore the Live Landing Page »</strong></a>
</p>

</div>

---

## 🌟 Overview

**Beacon** is built for developers who need fast, zero-fuss visibility into their Docker environment. 

A high-performance **Rust (Axum)** backend communicates directly with the Docker Engine API over the Unix socket (`/var/run/docker.sock`) and exposes an optimized REST/SSE interface, paired with an ultra-responsive **SolidJS** dashboard.

- **Zero-Config & Self-Contained:** No external databases, caches, or background agents required.
- **Ultra Low Overhead:** Rust backend with sub-millisecond response times and minimal memory footprint.
- **Real-Time Streaming:** Live log tailing, container resource stats, and Docker engine events via Server-Sent Events (SSE).

---

## ⚡ Quick Start (Run in 5 Seconds)

Run Beacon instantly using Docker:

```bash
docker run -d \
  --name beacon \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  beacon:latest
```

Open **[http://localhost:8000](http://localhost:8000)** in your browser to access the management dashboard.

Or with Docker Compose:

```bash
docker compose up -d
```

---

## ✨ Features

- **📊 Container Management & Insights**
  - List and inspect all containers with granular metadata.
  - View live top processes inside running containers.
  - Real-time log streaming and tailing.
  - Live CPU, memory, network, and disk I/O metrics.
  - Inspect filesystem diffs and export container filesystems.
- **⚡ Live Event Feed**
  - Real-time Server-Sent Events (SSE) stream reflecting Docker daemon events.
- **📦 Images, Volumes & Networks**
  - Browse images, tags, layers, networks, and volume attachments.
- **🌐 Dedicated Marketing Site**
  - Modern marketing and interactive showcase site hosted live at [https://beacon-logs.vercel.app/](https://beacon-logs.vercel.app/).

---

## 🏗️ Architecture

Beacon is organized as a clean monorepo:

```
beacon/
├── apps/
│   ├── server/          # High-performance Rust (Axum) API server
│   │   └── src/
│   │       ├── bootstrap/   # Router assembly and module registration
│   │       ├── client/      # Unix socket client for Docker Engine API
│   │       ├── config/      # Zero-config environment configuration
│   │       ├── global/      # Shared utilities and error handlers
│   │       └── modules/     # Feature modules (containers, images, events, etc.)
│   ├── web/             # SolidJS + Vite management dashboard (bundled into Docker release)
│   └── site/            # Standalone marketing landing site (hosted on Vercel)
├── docker-compose.yml       # Production single-container compose
├── docker-compose.dev.yml   # Dev compose with hot-reload
├── Dockerfile / Dockerfile.dev
└── justfile              # Task automation
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Rust, [Axum](https://github.com/tokio-rs/axum), Tokio, reqwest | Low-latency async socket communication & REST/SSE API |
| **Web Dashboard** | [SolidJS](https://www.solidjs.com/), Vite, Tailwind CSS | High-performance reactive UI bundled inside container (`:8000`) |
| **Marketing Site** | SolidJS, Vite, Tailwind CSS v4 | Public website hosted at [beacon-logs.vercel.app](https://beacon-logs.vercel.app/) |
| **Package Manager** | [Bun](https://bun.sh/) | Fast workspace dependency management |
| **Task Runner** | [just](https://github.com/casey/just) | Convenient developer CLI recipes |
| **Containerization** | Multi-stage Docker | Minimal Debian runtime producing an ultra-small image |

---

## 💻 Local Development

### Prerequisites
- [Rust](https://www.rust-lang.org/tools/install) (2024 edition toolchain)
- [Bun](https://bun.sh/) (v1.0+)
- [just](https://github.com/casey/just) (recommended task runner)
- Docker with access to `/var/run/docker.sock`

### Setup

```bash
git clone https://github.com/ssshashank/Beacon.git
cd Beacon
cp .env.default .env
```

### Running Locally

```bash
# 1. Run the Rust backend (port 8000)
just run

# 2. Run the Web Dashboard dev server (port 3000)
just web-install
just web-dev

# 3. Run the Marketing Site dev server (port 3001)
just site-dev
```

### Full Dev Stack with Docker Hot-Reload

```bash
just dev-up
```
Mounts live source code and socket with hot-reloading for both backend and frontend.

---

## 📋 Available Commands (`justfile`)

| Command | Description |
|---|---|
| **Production** | |
| `just prod-up` | Start production single-container stack (`alias: compose-up-prod`) |
| `just prod-down` | Stop production container (`alias: compose-down-prod`) |
| `just prod-logs` | Stream production container logs |
| `just prod-build` | Build production Docker image |
| `just prod-run` | Run production container directly with socket mount |
| **Development** | |
| `just dev-up` | Start full dev stack with hot-reload |
| `just dev-down` | Stop dev stack |
| `just dev-logs` | View dev stack logs |
| `just dev-up-backend` | Start only backend dev container |
| `just dev-up-frontend`| Start only frontend dev container |
| **Frontend & Site** | |
| `just web-dev` | Start dashboard dev server (Vite on `http://localhost:3000`) |
| `just web-build` | Build dashboard assets for production (`apps/web/dist/client`) |
| `just site-dev` | Start marketing site dev server (`http://localhost:3001`) |
| `just site-build` | Build marketing site for Vercel/Pages (`apps/site/dist`) |
| **Backend** | |
| `just run` | Run server locally (`cargo run -p beacon`) |
| `just check` | Type-check Rust backend |
| `just test` | Run Rust tests |
| `just build-release` | Build optimized release binary |

---

## 📡 API Overview

All API endpoints are namespaced under `/api/v1`.

### Containers — `/api/v1/containers`

| Method | Path | Description |
|---|---|---|
| `GET` | `/getAllContainers` | List all containers |
| `GET` | `/inspectContainer/{id}` | Inspect container details |
| `GET` | `/allProcessRunningInContainer/{id}` | List running processes inside container |
| `GET` | `/getContainerLogs/{id}` | Stream container logs |
| `GET` | `/getChangesOnContainerFileSystemById/{id}` | Get container filesystem changes |
| `GET` | `/exportContainerById/{id}` | Export container filesystem |
| `GET` | `/getContainerResourceUsageStatsById/{id}` | Live CPU, memory, and I/O stats |

### Events — `/api/v1/events`

| Method | Path | Description |
|---|---|---|
| `GET` | `/streamEvents` | Server-Sent Events (SSE) feed of Docker engine events |

---

## ⚙️ Environment Variables

Beacon runs zero-config by default. You can customize runtime behaviors via environment variables:

| Variable | Description | Default |
|---|---|---|
| `BEACON_PORT` | Port the HTTP server binds to | `8000` |
| `BEACON_HOST` | Network interface to listen on | `0.0.0.0` |
| `BEACON_DOCKER_SOCKET` | Path to Docker Unix domain socket | `/var/run/docker.sock` |
| `BEACON_DOCKER_API_VERSION` | Docker Engine API version | `v1.51` |
| `BEACON_WEB_DIR` | Static dashboard assets directory | `apps/web/dist/client` |
| `BEACON_CORS_ORIGIN` | Allowed CORS origin (for local development) | `""` |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
