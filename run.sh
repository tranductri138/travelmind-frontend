#!/bin/bash
IMAGE_NAME="travelmind-frontend"
CONTAINER_NAME="travelmind-frontend"
PORT=5001

# Load VITE_API_URL from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Building with VITE_API_URL=$VITE_API_URL"

# Stop and remove old container if exists
docker rm -f "$CONTAINER_NAME" 2>/dev/null

# Build image with env from .env
docker build \
  --build-arg VITE_API_URL="$VITE_API_URL" \
  -t "$IMAGE_NAME" .

# Run container (--add-host needed on Linux for host.docker.internal)
docker run -d \
  --name "$CONTAINER_NAME" \
  --add-host=host.docker.internal:host-gateway \
  -p "$PORT:$PORT" \
  "$IMAGE_NAME"

echo "Frontend running at http://localhost:$PORT"
