# Use the official Bun image
FROM oven/bun:1.2.21 as base

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the API executable
# We compile it into a single binary for extremely fast startup and tiny container size
RUN bun run build

# ---
# Final minimal image
FROM oven/bun:1.2.21-alpine

WORKDIR /app

# Copy only the compiled binary from the builder stage
COPY --from=base /app/build/api ./api

# Expose the API port
EXPOSE 3000

# Set production environment variable
ENV NODE_ENV=production

# Run the compiled binary
CMD ["./api"]
