# syntax=docker/dockerfile:1
#
# mini-vinci backend image: the Go API plus the Node ISL judge it shells out to.
# Build context is the repository root (this directory).

### Stage 1: build the Go API + seeder (pure Go, static binary) ###
FROM golang:1.22-bookworm AS gobuild
WORKDIR /src
COPY mini-vinci-be/go/go.mod mini-vinci-be/go/go.sum ./
RUN go mod download
COPY mini-vinci-be/go/ ./
ENV CGO_ENABLED=0
RUN go build -trimpath -o /out/server . \
 && go build -trimpath -o /out/seed ./cmd/seed

### Stage 2: build the Node judge (TypeScript -> dist), prune to prod deps ###
FROM node:20-bookworm-slim AS judgebuild
WORKDIR /judge
COPY mini-vinci-judge/package.json mini-vinci-judge/package-lock.json ./
RUN npm ci
COPY mini-vinci-judge/ ./
RUN npm run build && npm prune --omit=dev

### Stage 3: runtime (needs node for the judge; Go binary is static) ###
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Root CA certificates so the static Go binary can verify TLS for R2/S3 over
# HTTPS (the slim Node runtime image ships without a system CA bundle).
COPY --from=gobuild /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Go API + seeder
COPY --from=gobuild /out/server /app/server
COPY --from=gobuild /out/seed /app/seed

# Feature flags are read from the working directory.
COPY mini-vinci-be/go/featureflags.yml /app/featureflags.yml

# Judge: compiled output + production node_modules.
COPY --from=judgebuild /judge/dist /app/judge/dist
COPY --from=judgebuild /judge/node_modules /app/judge/node_modules
COPY --from=judgebuild /judge/package.json /app/judge/package.json

RUN mkdir -p /app/judge/submissions /data

ENV PORT=8080 \
    JUDGE_DIR=/app/judge \
    DATABASE_PATH=/data/minivinci.db \
    ASYNC_EAGER=true

EXPOSE 8080

# Seed problems (idempotent) on every boot, then start the API.
CMD ["/bin/sh", "-c", "/app/seed; exec /app/server -mode SERVER"]
