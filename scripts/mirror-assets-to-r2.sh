#!/usr/bin/env bash
#
# Mirror the ICFP Contest 2022 problem assets from the original (still-live)
# public S3 bucket into your own Cloudflare R2 bucket, so the revived site no
# longer depends on infrastructure you don't control.
#
# It copies:
#   - imageframes/*           (target frames + PNGs + initial configs)
#   - frozen_scoreboard.json  (the 2022 final standings)
#   - frozen_scoreboard_24.json
#
# Requirements: awscli v2.
#
# Usage:
#   export R2_BUCKET=minivinci-assets
#   export R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
#   export AWS_ACCESS_KEY_ID=<r2-access-key-id>
#   export AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>
#   ./scripts/mirror-assets-to-r2.sh
#
# Afterwards, expose the bucket publicly (r2.dev subdomain or a custom domain)
# and set ASSETS_BASE_URL (backend) and REACT_APP_ASSETS_BASE_URL (frontend) to
# that public base URL.
set -euo pipefail

: "${R2_BUCKET:?set R2_BUCKET to your R2 bucket name}"
: "${R2_ENDPOINT:?set R2_ENDPOINT to https://<account-id>.r2.cloudflarestorage.com}"
: "${AWS_ACCESS_KEY_ID:?set AWS_ACCESS_KEY_ID to your R2 access key id}"
: "${AWS_SECRET_ACCESS_KEY:?set AWS_SECRET_ACCESS_KEY to your R2 secret access key}"

SRC="s3://cdn.robovinci.xyz"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> Downloading assets from the original public bucket ($SRC) ..."
aws s3 sync "$SRC/imageframes/" "$TMP/imageframes/" --no-sign-request --region us-east-1
aws s3 cp "$SRC/frozen_scoreboard.json"    "$TMP/frozen_scoreboard.json"    --no-sign-request --region us-east-1
aws s3 cp "$SRC/frozen_scoreboard_24.json" "$TMP/frozen_scoreboard_24.json" --no-sign-request --region us-east-1 || true

echo "==> Uploading to R2 bucket: $R2_BUCKET ..."
aws s3 sync "$TMP/imageframes/" "s3://$R2_BUCKET/imageframes/" --endpoint-url "$R2_ENDPOINT" --region auto
aws s3 cp "$TMP/frozen_scoreboard.json" "s3://$R2_BUCKET/frozen_scoreboard.json" --endpoint-url "$R2_ENDPOINT" --region auto
[ -f "$TMP/frozen_scoreboard_24.json" ] && \
  aws s3 cp "$TMP/frozen_scoreboard_24.json" "s3://$R2_BUCKET/frozen_scoreboard_24.json" --endpoint-url "$R2_ENDPOINT" --region auto

echo "==> Done."
echo "    Make the bucket publicly readable, then set:"
echo "      ASSETS_BASE_URL            (Fly backend)   = <your public R2 base url>"
echo "      REACT_APP_ASSETS_BASE_URL  (Cloudflare FE) = <your public R2 base url>"
