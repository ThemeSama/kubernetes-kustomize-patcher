# ---- Stage 1: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ---- Stage 2: Runtime (Distroless) ----
FROM gcr.io/distroless/nodejs22:nonroot
WORKDIR /app

# Labels
LABEL org.opencontainers.image.title="Kustomize Patcher"
LABEL org.opencontainers.image.description="Mutating admission webhook for Kubernetes deployments patching."
LABEL org.opencontainers.image.url="https://github.com/themesama/kubernetes-kustomize-patcher"
LABEL org.opencontainers.image.source="https://github.com/themesama/kubernetes-kustomize-patcher"

# Environment variables for production
ENV NODE_ENV=production
ENV PORT=8443

# Copy build output only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Expose application port
EXPOSE 8443

# Mount a writable tmp directory (required for some Node libs)
VOLUME /tmp

# Start application (no shell available in Distroless)
CMD ["--no-warnings", "dist/index.cjs"]
