# Multi-stage build for xCloud Custom Docker deployments.
# xCloud never runs `docker build` — GitHub Actions (see
# .github/workflows/docker-build.yml) builds this image and pushes it to
# ghcr.io/homestayhubby/xcloudtest, and xCloud only pulls and runs it.

FROM node:22-slim AS build
# Build tools let native modules (sqlite3) compile when no prebuilt binary
# matches the Node version.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --include=dev

COPY tsconfig.json ./
COPY shared/ shared/
COPY server/ server/
COPY client/ client/
RUN npm run build --workspaces --if-present

# Reinstall with production dependencies only for the runtime image.
RUN rm -rf node_modules \
  && npm ci --omit=dev

FROM node:22-slim
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

COPY package.json ./package.json
COPY index.js ./index.js
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared/package.json ./shared/package.json
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

RUN mkdir -p /app/data && chown -R node:node /app
USER node
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["node", "index.js"]
