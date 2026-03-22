# ─────────────────────────────────────────────────────────────────────────────
# TimeKids — Dockerfile
# Multi-stage: build deps → lean production image
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ─────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# ── Stage 2: Production image ─────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root
RUN addgroup --system timekids && adduser --system --ingroup timekids timekids

WORKDIR /app

# Copy only what we need
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=timekids:timekids . .

# Remove dev / CI files
RUN rm -f .env.example docker-compose.yml Dockerfile

USER timekids

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/auth/me || exit 1

CMD ["node", "server.js"]
