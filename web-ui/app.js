const form = document.querySelector("#proxyForm");
const output = document.querySelector("#output");
const status = document.querySelector("#status");
const stopButton = document.querySelector("#stopOutput");
const panelTitle = document.querySelector("#panelTitle");

const panelTitles = {
  proxy: "Proxy",
  docker: "Docker",
  nginx: "Nginx",
  mariadb: "MariaDB",
  postgres: "Postgres",
  redis: "Redis",
  minio: "MinIO",
};

let stream = null;

document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-sidebar]");
  if (!toggle) return;

  document.body.classList.toggle("sidebar-collapsed");
  toggle.setAttribute("aria-expanded", String(!document.body.classList.contains("sidebar-collapsed")));
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setView(button.dataset.view);
    document.body.classList.remove("sidebar-collapsed");
  });
});

document.querySelector("#clearOutput").addEventListener("click", () => {
  output.textContent = "Waiting for action...";
});

stopButton.addEventListener("click", () => {
  stream?.close();
  stream = null;
  stopButton.disabled = true;
  setStatus("Stopped", "");
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => runAction(button.dataset.action));
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("danger") && !confirm("Run this command?")) return;
    runStream(streamUrl("/api/stream/run", { command: button.dataset.command }), button.dataset.label || button.textContent.trim());
  });
});

function runAction(action) {
  const data = formData();

  if (action === "proxy") {
    return runStream(streamUrl("/api/stream/proxy", data), commandPreview(action, data));
  }

  return runStream(streamUrl("/api/stream/host", {
    action: action === "host-add" ? "add" : "remove",
    domain: data.domain,
  }), commandPreview(action, data));
}

function runStream(url, preview) {
  stream?.close();
  stream = new EventSource(url);
  stopButton.disabled = false;
  setStatus("Running", "busy");
  output.textContent = `${preview}\n\n`;

  stream.onmessage = (event) => append(event.data);
  stream.addEventListener("done", (event) => {
    append(event.data);
    stream.close();
    stream = null;
    stopButton.disabled = true;
    setStatus(event.data.includes("[exit 0]") ? "Done" : "Error", event.data.includes("[exit 0]") ? "" : "error");
  });

  stream.onerror = () => {
    append("Stream connection closed");
    stream?.close();
    stream = null;
    stopButton.disabled = true;
    setStatus("Error", "error");
  };
}

function append(text) {
  output.textContent += `${text}\n`;
  output.scrollTop = output.scrollHeight;
}

function streamUrl(path, params) {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== false && value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value === true ? "1" : value);
    }
  });
  return url;
}

function formData() {
  const data = new FormData(form);
  return {
    domain: String(data.get("domain") || "").trim(),
    target: String(data.get("target") || "").trim(),
    port: Number(data.get("port")),
    ssl: data.get("ssl") === "on",
  };
}

function commandPreview(action, data) {
  if (action === "host-add") return `make host-add DOMAIN=${data.domain}`;
  if (action === "host-remove") return `make host-remove DOMAIN=${data.domain}`;

  return [
    "make app-proxy",
    `DOMAIN=${data.domain}`,
    `TARGET=${data.target}`,
    `PORT=${data.port}`,
    data.ssl ? "SSL=1" : "",
  ].filter(Boolean).join(" ");
}

function setStatus(text, state) {
  status.textContent = text;
  status.className = `status ${state || ""}`.trim();
}

function setView(view) {
  document.body.dataset.view = view;
  panelTitle.textContent = panelTitles[view] || "Infrastructure";

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}
