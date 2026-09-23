# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
# --legacy-peer-deps required due to eslint-config-airbnb-base peer dep constraints
RUN npm ci --omit=dev --legacy-peer-deps

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (everything except what's in .dockerignore)
COPY . .

# Run as a non-root user for security
RUN addgroup -S swapskill && adduser -S swapskill -G swapskill
USER swapskill

EXPOSE 5001

# Health check used by Docker Compose and container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5001/health || exit 1

CMD ["node", "server.js"]
