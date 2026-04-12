@echo off
REM JPE Studio — Quick Fixture Test Runner
REM Usage: test-fixtures\run-tests.bat

echo ═══════════════════════════════════════════════════════
echo   JPE Studio — Running Fixture Tests
echo ═══════════════════════════════════════════════════════
echo.

cd /d "%~dp0.."

echo [1/4] Checking fixture integrity...
npx tsx test-fixtures\run-tests.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════
    echo   All Tests Passed ✓
    echo ═══════════════════════════════════════════════════════
) else (
    echo.
    echo ═══════════════════════════════════════════════════════
    echo   Some Tests Failed ✗
    echo ═══════════════════════════════════════════════════════
    exit /b 1
)
