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
# Stage 2: Build Rust Backend (Statically linked with musl)
# ==============================================================================
FROM rust:1.97.1-slim AS server-builder

WORKDIR /app

# Install musl tools and ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends musl-tools ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy cargo manifests and source
COPY Cargo.toml Cargo.lock ./
COPY apps/server ./apps/server

# Build static release binary targeting musl
RUN TARGET="$(uname -m)-unknown-linux-musl" && \
    rustup target add "$TARGET" && \
    cargo build --release -p beacon --target "$TARGET" && \
    cp target/"$TARGET"/release/beacon /app/beacon

# ==============================================================================
# Stage 3: Minimal Runtime (scratch)
# ==============================================================================
FROM scratch

LABEL org.opencontainers.image.title="Beacon" \
      org.opencontainers.image.description="A lightweight, high-performance Docker monitoring & management tool built with Rust and SolidJS." \
      org.opencontainers.image.url="https://beacon-logs.vercel.app/" \
      org.opencontainers.image.source="https://github.com/M-Thousand/Beacon" \
      org.opencontainers.image.version="0.1.0" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy CA certificates for outbound HTTPS calls
COPY --from=server-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Copy compiled backend binary
COPY --from=server-builder /app/beacon /app/beacon

# Copy compiled frontend assets
COPY --from=web-builder /app/apps/web/dist/client /app/dist/client

# Default environment configuration (Zero-config out of the box)
ENV BEACON_PORT=8000 \
    BEACON_HOST=0.0.0.0 \
    BEACON_DOCKER_SOCKET=/var/run/docker.sock \
    BEACON_WEB_DIR=/app/dist/client

EXPOSE 8000

ENTRYPOINT ["/app/beacon"]
