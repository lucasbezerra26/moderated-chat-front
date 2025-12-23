#!/bin/bash

echo "🚀 Building Vue app with Docker..."

docker build -t frontend-build .

echo "📦 Extracting dist files..."

docker create --name temp-frontend frontend-build

docker cp temp-frontend:/app/dist ./dist

docker rm temp-frontend

echo "✅ Build completed! Files are in ./dist"

