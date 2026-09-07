#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$ROOT_DIR/api"
WEB_DIR="$ROOT_DIR/web"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is required to start the API database."
  exit 1
fi

if ! command -v go >/dev/null 2>&1; then
  echo "Error: go is required to start the API server."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required to start the web server."
  exit 1
fi

if [[ ! -d "$API_DIR" || ! -d "$WEB_DIR" ]]; then
  echo "Error: expected api/ and web/ directories under $ROOT_DIR."
  exit 1
fi

API_PID=""
WEB_PID=""

cleanup() {
  local exit_code=$?

  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "$WEB_PID" ]] && kill -0 "$WEB_PID" >/dev/null 2>&1; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi

  wait >/dev/null 2>&1 || true
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

echo "Starting MySQL container..."
(cd "$API_DIR" && docker compose up -d mysql)

echo "Starting API server on http://localhost:8080 ..."
(
  cd "$API_DIR"
  go run ./cmd/server
) &
API_PID=$!

echo "Starting web server on http://localhost:3000 ..."
(
  cd "$WEB_DIR"
  npm run dev
) &
WEB_PID=$!

echo "Both servers are starting. Press Ctrl+C to stop them."

wait -n "$API_PID" "$WEB_PID"
