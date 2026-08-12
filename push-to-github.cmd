@echo off
echo ========================================================
echo   Connecting NexusERP Operations Portal to GitHub
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/nexuserp-operations-portal.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborting.
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Pushing code to GitHub...
git push -u origin main

echo.
echo ========================================================
echo 🎉 Successfully pushed code to GitHub!
echo ========================================================
pause
