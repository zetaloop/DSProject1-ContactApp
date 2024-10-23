@echo off
setlocal
cd %~dp0

if not exist ..\frontend\out (
    echo "Please build frontend first"
    exit /b 1
)

if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

if exist static rmdir /s /q static
robocopy ..\frontend\out static /e

if exist venv rmdir /s /q venv
python -m venv venv

call venv\Scripts\activate.bat
pip install -r requirements.txt

pyinstaller -D --add-data "./static:static" --icon "../favicon.ico" main.py

pause
