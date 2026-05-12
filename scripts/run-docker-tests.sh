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

# Porta publicada no host (container continua em 3000). Padrão: 3450; se ocupada, próxima livre.
port_in_use() {
  local port=$1
  (echo >/dev/tcp/127.0.0.1/"$port") &>/dev/null
}

pick_web_host_port() {
  local start=3450
  local end=3550
  local p
  for ((p = start; p <= end; p++)); do
    if ! port_in_use "$p"; then
      echo "$p"
      return 0
    fi
  done
  echo ">> ERRO: nenhuma porta livre no host entre ${start} e ${end}." >&2
  return 1
}

if [[ -z "${DOCKER_WEB_HOST_PORT:-}" ]]; then
  DOCKER_WEB_HOST_PORT="$(pick_web_host_port)" || exit 1
  export DOCKER_WEB_HOST_PORT
fi
echo ">> Porta no host: ${DOCKER_WEB_HOST_PORT} → container :3000"

echo ">> Subindo app (web) no Docker..."
if ! docker compose up -d --build web; then
  echo ""
  echo ">> Falha ao subir o compose. Se for conflito de porta, defina manualmente, por exemplo:"
  echo "   DOCKER_WEB_HOST_PORT=3451 npm run test:docker:all"
  exit 1
fi

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
