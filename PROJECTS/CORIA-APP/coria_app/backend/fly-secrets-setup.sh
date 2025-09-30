#!/bin/bash
# Fly.io Secrets Setup Script for CORIA Backend

echo "Setting up Fly.io secrets for coria-backend..."

# IMPORTANT: Replace these values with your actual credentials
fly secrets set \
  NODE_ENV=production \
  PORT=8080 \
  API_PREFIX=api/v1 \
  JWT_SECRET="YOUR_SECURE_JWT_SECRET_HERE" \
  JWT_REFRESH_SECRET="YOUR_SECURE_REFRESH_SECRET_HERE" \
  SUPABASE_URL="https://bwvkhwppllcfzozajtbh.supabase.co" \
  SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_KEY" \
  RPC_ENDPOINT="https://api.mainnet-beta.solana.com" \
  DONATION_POOL_PUBKEY="7oV4PGX3nvkfCaeJqZgqTW2HkY36xg3JefNWqRQ7XWHZ" \
  PREMIUM_POOL_PUBKEY="GKRh2ccdwF4wMSndVfZgrcodQHSN9GxU2iLCiNTHjDxF" \
  PREMIUM_PRICE_SOL="0.025" \
  FOUNDATION_URL="https://foundation.coria.app" \
  KMS_ENABLED=false \
  REDIS_HOST="localhost" \
  REDIS_PORT=6379 \
  LOG_LEVEL="info" \
  CORS_ORIGINS="https://coria.app,https://www.coria.app" \
  ENABLE_SWAGGER=false \
  --app coria-backend

echo "Secrets set! Now deploy with: fly deploy"