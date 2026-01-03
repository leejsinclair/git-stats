#!/bin/sh
set -e

echo "Starting Git Stats Application..."

# Start backend in background
echo "Starting backend on port 3000..."
cd /app
npm start &

# Start frontend
echo "Starting frontend on port 5173..."
cd /app/frontend
npm run preview -- --host 0.0.0.0 --port 5173

# Keep container running
wait
