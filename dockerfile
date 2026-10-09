# Node base image from Amazon ECR Public (mirror of the Docker Official Image),
# which avoids Docker Hub pull rate limits when building/pulling on AWS
# (CodeBuild, ECS, App Runner).
FROM public.ecr.aws/docker/library/node:22-slim

# tini runs as PID 1 so `docker stop` / ECS SIGTERM reaches node and stops it.
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

WORKDIR /app

# Bundle APP files. `dist/` already contains the generated workspace manifest
# (dist/package.json) plus the compiled server packages under dist/packages,
# so the install below resolves everything from public npm.
COPY --chown=node:node dist/ .

# appdata/ holds uploads and published apps at runtime, so the app user must
# be able to write there (mount a volume over it to persist data).
RUN npm install --omit=dev && npm cache clean --force \
  && mkdir -p appdata && chown node:node /app appdata

# The base image ships an unprivileged `node` user.
USER node

# Runtime config (DB_URL, DB_USER, DB_PASSWORD, RUN_ENV, ...) is
# supplied by the ECS task definition / App Runner service, not baked in.
EXPOSE 8080

# Load balancer target groups and App Runner should probe the same path.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8080) + '/health/check', (r) => process.exit(r.statusCode == 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT [ "tini", "--" ]
CMD [ "node", "src/api/lowcode-api/index.js" ]
