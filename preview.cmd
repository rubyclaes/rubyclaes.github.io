@echo off
set "NO_UPDATE_CHECK=1"
echo Starting local preview (http://localhost:3000) ...
npx --yes --prefer-offline serve .
