#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

WEB_CONTAINER_NAME="clean-move-web"
UNIT_IMAGE_NAME="clean-move-unit-tests"

cleanup() {
  echo ""
  echo ">> Derrubando containers..."
  docker compose down --remove-orphans
}

trap cleanup EXIT

echo ">> Subindo app (web) no Docker..."
docker compose up -d --build web

echo ">> Aguardando healthcheck do web..."
for _ in {1..60}; do
  status="$(docker inspect --format='{{.State.Health.Status}}' "$WEB_CONTAINER_NAME" 2>/dev/null || true)"
  if [[ "$status" == "healthy" ]]; then
    echo ">> Web saudável."
    break
  fi
  sleep 2
done

final_status="$(docker inspect --format='{{.State.Health.Status}}' "$WEB_CONTAINER_NAME" 2>/dev/null || true)"
if [[ "$final_status" != "healthy" ]]; then
  echo ">> ERRO: web não ficou saudável a tempo."
  exit 1
fi

echo ">> Buildando imagem de testes unitários..."
docker build --target test -t "$UNIT_IMAGE_NAME" .

echo ">> Rodando testes unitários..."
docker run --rm "$UNIT_IMAGE_NAME" npm run test:run

echo ">> Rodando testes E2E..."
docker compose --profile e2e run --rm e2e

echo ">> Todos os testes finalizaram com sucesso."
