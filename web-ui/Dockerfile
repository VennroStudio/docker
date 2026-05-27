FROM node:24-alpine AS ui-build

WORKDIR /build
COPY web-ui/package.json web-ui/package-lock.json web-ui/tsconfig.json web-ui/vite.config.ts ./
COPY web-ui/commands.manifest.json ./commands.manifest.json
COPY web-ui/index.html ./index.html
COPY web-ui/logo.png ./logo.png
COPY web-ui/src ./src

RUN npm ci
RUN npm run build

FROM docker:27-cli

RUN apk add --no-cache make nodejs npm

COPY --from=ui-build /build/dist /opt/infrastructure-ui/dist
