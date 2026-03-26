# Stage 1: Build the application
FROM node:20-alpine as builder

WORKDIR /app

# Install curl for debugging
RUN apk add curl

# Define build argument
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXTAUTH_URL

# Copy all necessary files for pnpm to understand the monorepo
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/frontend ./apps/frontend

# Explicitly set NEXT_PUBLIC_BACKEND_URL for Next.js build
RUN echo "NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}" > apps/frontend/.env.production

# Install all dependencies (dev and prod) for building
RUN npm install -g pnpm && pnpm install --frozen-lockfile --filter=frontend

# Build the Next.js application from the frontend app directory
WORKDIR /app/apps/frontend
RUN pnpm build

# Stage 2: Create the final, lean production image
FROM node:20-alpine

WORKDIR /app

# Install curl for debugging
RUN apk add curl

# Copy all necessary files for pnpm to understand the monorepo
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/frontend ./apps/frontend

# Install only production dependencies
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile --filter=frontend

# Copy the built application output
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/next.config.js ./apps/frontend/next.config.js

# Set the working directory to the frontend app
WORKDIR /app/apps/frontend

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "start"]