@echo off
setlocal

set "ROOT=%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js topilmadi. Iltimos, Node.js o'rnating.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm topilmadi. Iltimos, Node.js bilan birga npm o'rnating.
  pause
  exit /b 1
)

if not exist "%ROOT%backend\node_modules" (
  echo Backend dependencies o'rnatilmoqda...
  pushd "%ROOT%backend"
  npm install
  if errorlevel 1 goto :fail
  popd
)

if not exist "%ROOT%frontend\node_modules" (
  echo Frontend dependencies o'rnatilmoqda...
  pushd "%ROOT%frontend"
  npm install
  if errorlevel 1 goto :fail
  popd
)

start "Backend" cmd /k "cd /d \"%ROOT%backend\" && npm run dev"
start "Frontend" cmd /k "cd /d \"%ROOT%frontend\" && npm run dev"

echo Loyiha ishga tushdi.
exit /b 0

:fail
echo O'rnatishda xatolik yuz berdi.
pause
exit /b 1
