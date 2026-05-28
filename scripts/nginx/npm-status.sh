#!/usr/bin/env sh
set -eu

COMPOSE_DIR="${COMPOSE_DIR:-docker/compose}"
SETTINGS_FILE="${INFRA_SETTINGS_FILE:-config/settings.json}"
COMPOSE_ENV_ARGS=""
if [ -f .env ]; then
  COMPOSE_ENV_ARGS="--env-file .env"
fi

COMPOSE_FILE="${COMPOSE_DIR}/docker-compose-npm.yml"
CONTAINER="$(
  docker compose $COMPOSE_ENV_ARGS -f "$COMPOSE_FILE" config --format json |
    sed -n 's/.*"container_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' |
    head -n 1
)"

STATUS="$(
  docker ps -a --filter "name=^/${CONTAINER}$" --format "{{.Status}}" |
    head -n 1
)"
DOCKER_STATE="$(
  docker inspect --format "{{.State.Status}}" "$CONTAINER" 2>/dev/null ||
    true
)"

RUNNING=false
STATE="missing"
UPTIME="not created"
URL="$(
  sed -n '/"proxy"[[:space:]]*:/,/[}]/s/.*"npmPublicUrl"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$SETTINGS_FILE" 2>/dev/null |
    head -n 1
)"

if [ -n "$STATUS" ]; then
  UPTIME="$STATUS"
  STATE="${DOCKER_STATE:-unknown}"
  if [ "$STATE" = "running" ]; then
    RUNNING=true
  fi
fi

printf '{\n'
printf '  "container": "%s",\n' "$CONTAINER"
printf '  "running": %s,\n' "$RUNNING"
printf '  "state": "%s",\n' "$STATE"
printf '  "uptime": "%s",\n' "$UPTIME"
printf '  "url": "%s"\n' "$URL"
printf '}\n'
