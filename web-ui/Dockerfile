FROM node:24-alpine AS ui-build

WORKDIR /build
COPY web-ui/package.json web-ui/package-lock.json web-ui/tsconfig.json web-ui/vite.config.ts ./
COPY web-ui/commands.manifest.json ./commands.manifest.json
COPY web-ui/index.html ./index.html
COPY web-ui/logo.png ./logo.png
COPY web-ui/src ./src

RUN npm ci
RUN npm run build

FROM docker:27-cli AS runtime

RUN apk add --no-cache make nodejs npm

ENV HOSTS_FILE=/host/etc/hosts
ENV UI_STATIC_DIR=/opt/web-ui/dist

FROM runtime

COPY --from=ui-build /build/dist /opt/web-ui/dist

ENTRYPOINT ["node"]
CMD ["./web-ui/server.mjs"]
