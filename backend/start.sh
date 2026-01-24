#!/bin/bash

echo "========================================"
echo "  Vidalita Backend Server"
echo "========================================"
echo ""
echo "Server ishga tushmoqda..."
echo ""

# Executable faylni topish
if [ -f "backend-linux" ]; then
    ./backend-linux
elif [ -f "dist/backend-linux" ]; then
    ./dist/backend-linux
elif [ -f "backend-macos" ]; then
    ./backend-macos
elif [ -f "dist/backend-macos" ]; then
    ./dist/backend-macos
else
    echo "Xatolik: Executable fayl topilmadi!"
    echo "Iltimos, avval build qiling: npm run build:linux yoki npm run build:mac"
    exit 1
fi

