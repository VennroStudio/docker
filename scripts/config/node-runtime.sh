#!/usr/bin/env sh
set -eu

ACTION="${1:-ensure}"
NODE_VERSION="${NODE_RUNTIME_VERSION:-v24.11.1}"
RUNTIME_DIR="${NODE_RUNTIME_DIR:-.runtime/node}"
CACHE_DIR="${NODE_RUNTIME_CACHE_DIR:-.runtime/cache}"

platform() {
  os="$(uname -s)"
  arch="$(uname -m)"

  case "$arch" in
    x86_64 | amd64) arch="x64" ;;
    arm64 | aarch64) arch="arm64" ;;
    *) echo "Unsupported architecture: $arch" >&2; exit 1 ;;
  esac

  case "$os" in
    Darwin) echo "darwin-$arch" ;;
    Linux) echo "linux-$arch" ;;
    MINGW* | MSYS* | CYGWIN*) echo "win-$arch" ;;
    *) echo "Unsupported OS: $os" >&2; exit 1 ;;
  esac
}

node_path() {
  case "$(platform)" in
    win-*) printf "%s/node.exe\n" "$RUNTIME_DIR" ;;
    *) printf "%s/bin/node\n" "$RUNTIME_DIR" ;;
  esac
}

ensure() {
  node_bin="$(node_path)"
  if [ -x "$node_bin" ]; then
    return
  fi

  package_platform="$(platform)"
  package_name="node-${NODE_VERSION}-${package_platform}"
  mkdir -p "$CACHE_DIR" "$(dirname "$RUNTIME_DIR")"

  if [ "${package_platform#win-}" != "$package_platform" ]; then
    archive="${CACHE_DIR}/${package_name}.zip"
    url="https://nodejs.org/dist/${NODE_VERSION}/${package_name}.zip"
  else
    archive="${CACHE_DIR}/${package_name}.tar.xz"
    url="https://nodejs.org/dist/${NODE_VERSION}/${package_name}.tar.xz"
  fi

  if [ ! -f "$archive" ]; then
    echo "Downloading Node.js ${NODE_VERSION} (${package_platform})..."
    curl -fsSL "$url" -o "$archive"
  fi

  rm -rf "$RUNTIME_DIR"

  if [ "${package_platform#win-}" != "$package_platform" ]; then
    tmp_dir="${CACHE_DIR}/${package_name}"
    rm -rf "$tmp_dir"
    mkdir -p "$tmp_dir"
    powershell.exe -NoProfile -Command "Expand-Archive -Force '$archive' '$tmp_dir'" >/dev/null
    mv "$tmp_dir/$package_name" "$RUNTIME_DIR"
  else
    mkdir -p "$RUNTIME_DIR"
    tar -xJf "$archive" --strip-components=1 -C "$RUNTIME_DIR"
  fi

  chmod +x "$(node_path)" 2>/dev/null || true
}

case "$ACTION" in
  ensure)
    ensure
    ;;
  path)
    ensure
    node_path
    ;;
  run)
    shift
    ensure
    exec "$(node_path)" "$@"
    ;;
  *)
    echo "Usage: $0 ensure|path|run [node args...]" >&2
    exit 1
    ;;
esac
