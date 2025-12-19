# Build stage
FROM node:22.14.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@latest

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build
RUN ls
#
## Final stage - only dist files
#FROM alpine:latest
#
## Copy dist files from build stage
#COPY --from=build-stage /app/dist /app/dist
#
## Set working directory
#WORKDIR /app
#
## Default command
#CMD ["echo", "Build completed. Dist files available in /app/dist"]
CMD ["pnpm", "run", "dev"]
