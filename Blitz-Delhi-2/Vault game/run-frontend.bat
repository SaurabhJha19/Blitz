@echo off
echo Starting Vault Game Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..
echo Frontend starting on http://localhost:3000
pause
