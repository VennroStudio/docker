export function shellPreview(container: string) {
  if (container === "nginx-container") return "make npm-shell";
  if (container === "phpmyadmin-container") return "make phpmyadmin-shell";
  if (container === "pgadmin-container") return "make pgadmin-shell";
  if (container === "redis-container") return "make redis-shell";
  if (container === "redisinsight-container") return "make redisinsight-shell";
  if (container === "rustfs-container") return "make rustfs-shell";
  if (container === "registry-container") return "make registry-shell";
  if (container === "registry-ui-container") return "make registry-ui-shell";
  if (container.startsWith("mariadb-")) return `make mariadb-instance-shell CONTAINER=${container}`;
  if (container.startsWith("postgres-")) return `make postgres-instance-shell CONTAINER=${container}`;
  return `make compose-shell CONTAINER=${container}`;
}
