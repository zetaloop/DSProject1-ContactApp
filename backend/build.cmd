@echo off
setlocal
cd %~dp0

if not exist ..\frontend\out (
    echo "Please build frontend first"
    exit /b 1
)

if not exist venv (
    python -m venv venv
    pip install -r requirements.txt
)
call venv\Scripts\activate.bat
pip install -r requirements.txt

if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

if exist static rmdir /s /q static
xcopy /s /e ..\frontend\out\ static\

pyinstaller -D --add-data "./static:static" --icon "../favicon.ico" main.py

pause
