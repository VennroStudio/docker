#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"
DOMAIN="${2:-}"
HOST_IP="${HOST_IP:-127.0.0.1}"
HOSTS_FILE="${HOSTS_FILE:-/etc/hosts}"
MARKER="# infrastructure"

usage() {
  echo "Usage: make host-add DOMAIN=site.local"
  echo "       make host-remove DOMAIN=site.local"
}

fail() {
  echo "$1"
  exit 1
}

domain_exists() {
  awk -v domain="$DOMAIN" '
    $1 !~ /^#/ {
      for (i = 2; i <= NF; i++) {
        if ($i == domain) found = 1
      }
    }
    END { exit found ? 0 : 1 }
  ' "$HOSTS_FILE"
}

write_hosts() {
  if [[ -w "$HOSTS_FILE" ]]; then
    cp "$1" "$HOSTS_FILE"
  else
    sudo cp "$1" "$HOSTS_FILE"
  fi
}

backup_hosts() {
  if [[ -w "$HOSTS_FILE" ]]; then
    cp "$HOSTS_FILE" "$HOSTS_FILE.infrastructure.bak"
  else
    sudo cp "$HOSTS_FILE" "$HOSTS_FILE.infrastructure.bak"
  fi
}

add_domain() {
  if domain_exists; then
    echo "$DOMAIN already exists in $HOSTS_FILE"
    return
  fi

  if [[ -w "$HOSTS_FILE" ]]; then
    printf "%s\t%s %s\n" "$HOST_IP" "$DOMAIN" "$MARKER" >> "$HOSTS_FILE"
  else
    printf "%s\t%s %s\n" "$HOST_IP" "$DOMAIN" "$MARKER" | sudo tee -a "$HOSTS_FILE" >/dev/null
  fi

  echo "Added $DOMAIN -> $HOST_IP to $HOSTS_FILE"
}

remove_domain() {
  if ! domain_exists; then
    echo "$DOMAIN is not present in $HOSTS_FILE"
    return
  fi

  tmp_file="$(mktemp)"
  awk -v domain="$DOMAIN" '
    $1 ~ /^#/ { print; next }
    {
      keep = 1
      for (i = 2; i <= NF; i++) {
        if ($i == domain) keep = 0
      }
      if (keep) print
    }
  ' "$HOSTS_FILE" > "$tmp_file"

  backup_hosts
  write_hosts "$tmp_file"
  rm -f "$tmp_file"

  echo "Removed $DOMAIN from $HOSTS_FILE"
}

[[ -n "$ACTION" && -n "$DOMAIN" ]] || { usage; exit 1; }
[[ "$DOMAIN" =~ ^[a-zA-Z0-9.-]+$ ]] || fail "Invalid DOMAIN: $DOMAIN"

case "$ACTION" in
  add) add_domain ;;
  remove) remove_domain ;;
  *) usage; exit 1 ;;
esac