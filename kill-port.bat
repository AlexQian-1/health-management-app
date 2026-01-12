@echo off
echo 正在查找占用端口 3001 的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo 正在关闭进程 PID: %%a
    taskkill /PID %%a /F
)
echo.
echo 现在可以运行: npm run dev
pause
