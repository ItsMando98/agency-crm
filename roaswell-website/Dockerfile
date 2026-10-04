FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy application code
COPY apps/web ./apps/web

# Build production client and server
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node modules and built bundles
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/public ./apps/web/public

# Symlink /dist to /app/dist so relative path resolution (../../dist) works from any working directory
RUN ln -s /app/dist /dist

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["npx", "react-router-serve", "dist/apps/web/server/index.js"]
