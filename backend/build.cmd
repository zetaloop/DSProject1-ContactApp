@echo off
chcp 65001 >nul
setlocal
cd %~dp0

where uv
if %errorlevel% neq 0 (
    echo "Please install uv"
    exit /b 1
)

if not exist ..\frontend\out (
    echo "Please build frontend first"
    exit /b 1
)

if not exist .venv (
    uv sync
)
call .venv\Scripts\activate.bat

if exist dist rmdir /s /q dist
if exist build rmdir /s /q build

if exist static rmdir /s /q static
xcopy /s /e ..\frontend\out\ static\

pyinstaller -D --noconsole --add-data "./static:static" --icon "../favicon.ico" main.py

pause
