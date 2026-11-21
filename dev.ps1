# Navigate to the project root
Set-Location $PSScriptRoot

# Activate Python virtual environment
& ".\src\backend\.venv\Scripts\Activate.ps1"

# Navigate to backend
Set-Location ".\src\backend"

# Run snapshot maintenance commands
python manage.py cleanup_snapshots
python manage.py snapshots

# Start Django development server
$backend = Start-Process python -ArgumentList "manage.py runserver" -PassThru -NoNewWindow

# Start Vite development server
Set-Location "..\frontend"
$frontend = Start-Process cmd.exe -ArgumentList "/c npm run dev" -PassThru -NoNewWindow

try {
    # Keep the script running
    Wait-Process -Id $backend.Id, $frontend.Id
}
finally {
    # Stop both servers and their child processes
    taskkill /PID $backend.Id /T /F 2>$null
    taskkill /PID $frontend.Id /T /F 2>$null
}