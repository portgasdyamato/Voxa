@echo off
echo ===============================================
echo Voice Task Manager - Database Setup Helper
echo ===============================================
echo.
echo This script will help you set up a free PostgreSQL database
echo for your Voice Task Manager project.
echo.
echo STEP 1: Get a free database
echo ----------------------------------------
echo Option A - Neon (Recommended):
echo 1. Visit: https://neon.tech
echo 2. Create a free account
echo 3. Create a new database project
echo 4. Copy your connection string
echo.
echo Option B - Supabase:
echo 1. Visit: https://supabase.com
echo 2. Create a free account
echo 3. Create a new project
echo 4. Go to Settings ^> Database
echo 5. Copy the connection string
echo.
echo STEP 2: Update your .env file
echo ----------------------------------------
echo Replace the DATABASE_URL in your .env file with your connection string
echo.
echo STEP 3: Setup database schema
echo ----------------------------------------
echo After updating .env, run: npm run db:push
echo.
echo STEP 4: Start the application
echo ----------------------------------------
echo Run: npm run dev
echo.
echo Press any key to continue...
pause >nul

echo.
echo Would you like me to open the Neon website? (y/n)
set /p choice="Enter choice: "
if /i "%choice%"=="y" (
    start https://neon.tech
    echo Browser opened. Follow the setup instructions above.
) else (
    echo You can manually visit https://neon.tech when ready.
)

echo.
echo After setting up your database:
echo 1. Update the DATABASE_URL in your .env file
echo 2. Run: npm run db:push
echo 3. Run: npm run dev
echo.
echo Press any key to exit...
pause >nul
