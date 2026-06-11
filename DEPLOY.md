# Deploying mini-vinci

The revival has two deployables:

- **Backend** → Fly.io (one container: the Go API + the Node judge + SQLite on a volume)
- **Frontend** → Cloudflare Pages (static React build)

Object storage (Cloudflare R2) is used for **submission files** and, optionally,
for hosting the **problem assets**. You need a Cloudflare account and a Fly.io
account.

---

## 1. Cloudflare R2 (object storage)

1. In the Cloudflare dashboard → **R2** → create two buckets, e.g.
   `minivinci-submissions` and `minivinci-assets` (you can also reuse one).
2. **R2** → **Manage API Tokens** → create an **Account API token** with
   read/write to those buckets. Note the **Access Key ID**, **Secret Access
   Key**, and your **endpoint** `https://<account-id>.r2.cloudflarestorage.com`.
3. (Recommended) Mirror the problem assets into your assets bucket so the site
   doesn't depend on the original contest bucket:

   ```bash
   export R2_BUCKET=minivinci-assets
   export R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   export AWS_ACCESS_KEY_ID=<r2-access-key-id>
   export AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
   ./scripts/mirror-assets-to-r2.sh
   ```

4. Make the **assets** bucket publicly readable: in its settings enable the
   **r2.dev** public URL or attach a **custom domain**. That public base URL
   (e.g. `https://pub-xxxx.r2.dev` or `https://assets.yourdomain.com`) becomes
   your `ASSETS_BASE_URL`. (The submissions bucket can stay private — the API
   serves those via presigned URLs.)

> You can skip R2 for assets entirely and keep the default
> `ASSETS_BASE_URL=https://s3.amazonaws.com/cdn.robovinci.xyz`, but you still
> need an R2 (or other S3-compatible) bucket for submissions.

---

## 2. Backend on Fly.io

From the repository root (where `Dockerfile` and `fly.toml` live):

```bash
fly auth login

# Create the app (edit the `app` name in fly.toml first, or pass --name)
fly launch --no-deploy --copy-config

# Persistent volume for the SQLite database (same name as in fly.toml)
fly volumes create minivinci_data --size 1 --region iad
```

Set secrets (never commit these):

```bash
fly secrets set \
  JWT_LOGIN_SECRET="$(openssl rand -hex 32)" \
  JWT_VERIFICATION_SECRET="$(openssl rand -hex 32)" \
  JWT_RENEW_PASSWORD_SECRET="$(openssl rand -hex 32)" \
  S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com" \
  S3_REGION="auto" \
  S3_SUBMISSIONS_BUCKET="minivinci-submissions" \
  S3_ACCESS_KEY_ID="<r2-access-key-id>" \
  S3_SECRET_ACCESS_KEY="<r2-secret-access-key>" \
  ADMIN_EMAILS="you@example.com"
```

If you mirrored the assets to R2, also set the public base URL (either as a
secret/env here, or in `fly.toml` under `[env]`):

```bash
fly secrets set ASSETS_BASE_URL="https://<your-public-r2-base-url>"
```

Deploy and grab the URL:

```bash
fly deploy
fly status      # note the https://<app>.fly.dev hostname
```

Sanity check:

```bash
curl https://<app>.fly.dev/healthz          # {"status":"ok"}
```

The container seeds the 40 problems on every boot (idempotent) and runs
evaluation synchronously, so no Redis/worker is needed.

---

## 3. Frontend on Cloudflare Pages

In the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
connect your Git repo, then set:

| Setting | Value |
| --- | --- |
| Framework preset | Create React App |
| Root directory | `mini-vinci-fe` |
| Build command | `npm install --legacy-peer-deps && npm run build` |
| Build output directory | `build` |

Environment variables (Production **and** Preview):

| Variable | Value |
| --- | --- |
| `REACT_APP_API_URL` | `https://<app>.fly.dev` |
| `REACT_APP_ASSETS_BASE_URL` | your public assets base URL (R2 or the default bucket) |
| `CI` | `false` (so lint warnings don't fail the build) |

`public/_redirects` is already included so client-side routes (`/login`,
`/problems`, …) and refreshes resolve to `index.html`.

### Or deploy from the CLI

```bash
cd mini-vinci-fe
REACT_APP_API_URL="https://<app>.fly.dev" \
REACT_APP_ASSETS_BASE_URL="https://<assets-base-url>" \
CI=false npm run build
npx wrangler pages deploy build --project-name mini-vinci
```

---

## 4. CORS

The API already returns `Access-Control-Allow-Origin: *`, so the Pages site can
call the Fly backend cross-origin out of the box. To lock it down to your Pages
domain, edit the `CORS()` handler in `mini-vinci-be/go/server/routers.go`.

---

## Notes & options

- **Email / verification.** Disabled by default (`EMAIL_ENABLED=false`), so new
  accounts are usable immediately. To enable AWS SES, set `EMAIL_ENABLED=true`
  plus `EMAIL_*` variables.
- **Scoreboard.** `featureflags.yml` ships with `update_scoreboard: true`, so the
  scoreboard is computed live from the database. Set it to `false` to serve the
  frozen 2022 final standings from `ASSETS_BASE_URL/frozen_scoreboard.json`.
- **Background worker mode.** If you prefer asynchronous evaluation, set
  `ASYNC_EAGER=false`, provide `REDIS_ADDRESS`, and run a second process with
  `-mode WORKER`.
