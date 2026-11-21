#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")" || exit 1

# Activate Python virtual environment
if [ -f "src/backend/.venv/bin/activate" ]; then
    source "src/backend/.venv/bin/activate"
elif [ -f "src/backend/.venv/Scripts/activate" ]; then
    source "src/backend/.venv/Scripts/activate"
else
    echo "Error: Python virtual environment not found."
    exit 1
fi

# Run snapshot maintenance commands
cd src/backend || exit 1
python manage.py cleanup_snapshots
python manage.py snapshots

# Start Django development server
python manage.py runserver &
BACKEND_PID=$!

# Start Vite development server
cd ../frontend || exit 1
npm run dev &
FRONTEND_PID=$!

# Stop both servers when the script exits
trap 'kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null' EXIT

# Keep the script running while both servers are active
wait