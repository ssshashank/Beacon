# ==============================================================================
# Stage 1: Build SolidJS Frontend
# ==============================================================================
FROM oven/bun:1 AS web-builder

WORKDIR /app

# Copy root workspace and web package definitions
COPY package.json bun.lockb* ./
COPY apps/web/package.json ./apps/web/

# Install web dependencies
RUN bun install

# Copy web source and build client static assets
COPY apps/web ./apps/web
WORKDIR /app/apps/web
ENV VITE_BASE_URL=/api/v1
RUN bun run build

# ==============================================================================
# Stage 2: Build Rust Backend
# ==============================================================================
FROM rust:1.97.1-slim AS server-builder

WORKDIR /app

# Copy cargo manifests and source
COPY Cargo.toml Cargo.lock ./
COPY apps/server ./apps/server

# Build release binary
RUN cargo build --release -p beacon

# ==============================================================================
# Stage 3: Minimal Runtime
# ==============================================================================
FROM debian:trixie-slim

WORKDIR /app

# Install ca-certificates for secure outbound calls if needed
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy compiled backend binary
COPY --from=server-builder /app/target/release/beacon /app/beacon

# Copy compiled frontend assets
COPY --from=web-builder /app/apps/web/dist/client /app/dist/client

# Default environment configuration (Zero-config out of the box)
ENV BEACON_PORT=8000 \
    BEACON_HOST=0.0.0.0 \
    BEACON_DOCKER_SOCKET=/var/run/docker.sock \
    BEACON_WEB_DIR=/app/dist/client

EXPOSE 8000

ENTRYPOINT ["/app/beacon"]
