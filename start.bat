@echo off
echo Starting Personality Quiz Bot...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Please install Python and try again.
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking required packages...
pip show flask flask-cors google-generativeai >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Failed to install required packages.
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

REM Start Python backend
echo Starting backend server...
start cmd /k "python app.py"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5

REM Check if backend is running
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo Backend server failed to start.
    echo Please check the error messages in the backend window.
    pause
    exit /b 1
)

REM Open frontend in browser
echo Starting frontend...
start "" "index.html"

echo.
echo Bot is running successfully!
echo You can now interact with the chatbot in your browser.
echo.
echo To stop the bot:
echo 1. Close the browser window
echo 2. Close the backend command prompt window
echo 3. Close this window
echo.
pause 