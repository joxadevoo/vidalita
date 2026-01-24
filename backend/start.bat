@echo off
echo ========================================
echo   Vidalita Backend Server
echo ========================================
echo.
echo Server ishga tushmoqda...
echo.

REM Executable faylni topish
if exist "backend-win.exe" (
    start backend-win.exe
) else if exist "dist\backend-win.exe" (
    start dist\backend-win.exe
) else (
    echo Xatolik: Executable fayl topilmadi!
    echo Iltimos, avval build qiling: npm run build:win
    pause
    exit /b 1
)

echo.
echo Server ishga tushdi!
echo Browser'da oching: http://localhost:5001
echo.
echo Server'ni to'xtatish uchun bu oynani yoping yoki Ctrl+C bosing
echo.
pause

