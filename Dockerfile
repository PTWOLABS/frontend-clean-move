FROM node:22-bookworm-slim AS base

WORKDIR /app

FROM base AS deps

RUN chown node:node /app

COPY --chown=node:node package.json package-lock.json* ./

USER node

RUN npm ci

FROM deps AS build

COPY --chown=node:node . .

RUN npm run build

FROM deps AS test

COPY --chown=node:node . .

CMD ["npm", "run", "test:run"]

FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN chown node:node /app

USER node

COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.next ./.next
COPY --chown=node:node --from=build /app/package.json ./package.json
COPY --chown=node:node --from=build /app/next.config.ts ./next.config.ts
COPY --chown=node:node --from=build /app/scripts ./scripts
COPY --chown=node:node --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
