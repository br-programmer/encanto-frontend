# Stage 1: Install dependencies
FROM node:22-slim AS deps
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for NEXT_PUBLIC_ env vars (needed at build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CDN_HOSTNAME

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CDN_HOSTNAME=$NEXT_PUBLIC_CDN_HOSTNAME

RUN pnpm build

# Stage 3: Production
FROM node:22-slim AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
