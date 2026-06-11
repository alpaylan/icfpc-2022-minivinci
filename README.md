# mini-vinci

A revival of **mini-vinci**, the reference implementation built for the
[ICFP Programming Contest 2022](https://icfpcontest2022.github.io/) ("RoboVinci").
In the contest, teams write programs in a small **Instruction Set Language (ISL)**
that paint a canvas, trying to reproduce a target image at the lowest possible
cost (instruction cost + pixel-similarity cost).

This repository modernizes the original organizer codebase so it can be run and
hosted again from scratch, with a much smaller infrastructure footprint:

| Component | Original (2022) | This revival |
| --- | --- | --- |
| Database | AWS RDS (PostgreSQL) | **SQLite** (single file on a volume) |
| Object storage | AWS S3 | **Cloudflare R2** (S3-compatible) — or local/S3 |
| Async queue | Redis + asynq | **none** (synchronous "eager" evaluation) |
| Email | AWS SES | **none** (accounts auto-verify) |
| Frontend host | — | **Cloudflare Pages** |
| Backend host | — | **Fly.io** (Go API + Node judge in one container) |

> **Problem assets.** The original problem images and the final 2022 scoreboard
> are still available in the contest's public S3 bucket and are used by default.
> You can mirror them into your own R2 bucket with
> [`scripts/mirror-assets-to-r2.sh`](scripts/mirror-assets-to-r2.sh) so the
> revival doesn't depend on infrastructure you don't control.

## Repository layout

```
mini-vinci-fe/             React + MUI frontend (the contest site)
mini-vinci-be/go/          Go API (auth, problems, submissions, scoreboard)
  cmd/seed/                Seeds the 40 problems into the database
mini-vinci-judge/          Node/TypeScript ISL judge (the API shells out to it)
mini-vinci-data-converter/ Small data utility
Specifications/            Contest + ISL language specifications
Dockerfile, fly.toml       Backend container + Fly.io deploy config
scripts/                   Asset-mirroring helper
DEPLOY.md                  Step-by-step deployment guide
```

How a submission is scored: the frontend (or the API) sends ISL code to the
backend, which stores it and **eagerly** runs the Node judge. The judge fetches
the problem's target frame from `ASSETS_BASE_URL`, interprets the ISL, renders
the canvas, and reports `instruction cost + similarity cost`. The frontend can
also interpret and score ISL entirely in the browser (Playground + submission
preview) using the same logic in `mini-vinci-fe/src/contest-logic`.

## Local development

### 1. Build the judge (once)

```bash
cd mini-vinci-judge
npm ci
npm run build      # compiles TypeScript to dist/
```

### 2. Run the backend

```bash
cd mini-vinci-be/go
cp .env.example .env     # tweak as needed (see the file for every variable)

# Seed the 40 problems, then start the API on :8080
go run ./cmd/seed
go run . -mode SERVER
```

With the defaults this uses a local SQLite file, runs evaluation synchronously,
auto-verifies new accounts, and fetches problem assets from the original public
bucket. **Submissions need S3-compatible object storage.** For a fully local
loop, run MinIO and point the `S3_*` variables at it:

```bash
docker run -d -p 9000:9000 --name minio \
  minio/minio server /data
# create a bucket named "minivinci-submissions" (MinIO console / mc), then:
export S3_ENDPOINT=http://localhost:9000 S3_REGION=us-east-1 \
       S3_SUBMISSIONS_BUCKET=minivinci-submissions \
       S3_ACCESS_KEY_ID=minioadmin S3_SECRET_ACCESS_KEY=minioadmin
```

### 3. Run the frontend

```bash
cd mini-vinci-fe
npm install --legacy-peer-deps
REACT_APP_API_URL=http://localhost:8080 npm start   # http://localhost:3000
```

## Deployment

The frontend deploys to **Cloudflare Pages** and the backend to **Fly.io**.
See **[DEPLOY.md](DEPLOY.md)** for the full walkthrough (R2 bucket, Fly volume,
secrets, and Pages build settings).

```bash
# backend (from the repo root)
fly launch --no-deploy
fly volumes create minivinci_data --size 1
fly secrets set JWT_LOGIN_SECRET=... JWT_VERIFICATION_SECRET=... JWT_RENEW_PASSWORD_SECRET=...
fly deploy

# frontend
cd mini-vinci-fe && npm run build      # build/ -> Cloudflare Pages
```

## Credits & license

Originally created by the ICFP Contest 2022 organizing team. Released under the
[MIT License](LICENSE).
