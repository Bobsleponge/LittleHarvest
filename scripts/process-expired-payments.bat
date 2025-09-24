@echo off
REM Batch file to process expired payments on Windows
REM This can be scheduled using Windows Task Scheduler

echo Starting expired payment processing...
echo Time: %date% %time%

cd /d "%~dp0.."
node scripts/process-expired-payments.js

if %errorlevel% equ 0 (
    echo Expired payment processing completed successfully
) else (
    echo Expired payment processing failed with error code %errorlevel%
)

pause
