@echo off
echo Setting up Vault Game Frontend...
echo.

REM Copy artifacts
echo Copying contract artifacts...
xcopy /E /I /Y artifacts frontend\artifacts >nul 2>&1
echo ✓ Artifacts copied

REM Install dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo ✓ Frontend setup complete!
echo.
echo To run the frontend:
echo   1. Start Hardhat node: npm run node
echo   2. Deploy contract: npm run deploy
echo   3. Start frontend: cd frontend ^&^& npm run dev
echo.
pause
