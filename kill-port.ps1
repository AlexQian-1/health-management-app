# PowerShell script to kill process using port 3001
param(
    [int]$Port = 3001
)

Write-Host "正在查找占用端口 $Port 的进程..." -ForegroundColor Yellow

$connections = netstat -ano | findstr ":$Port"
if ($connections) {
    $pids = $connections | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne "0") {
            Write-Host "正在关闭进程 PID: $pid" -ForegroundColor Red
            taskkill /PID $pid /F 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 成功关闭进程 $pid" -ForegroundColor Green
            } else {
                Write-Host "✗ 无法关闭进程 $pid (可能需要管理员权限)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✓ 端口 $Port 未被占用" -ForegroundColor Green
}

Write-Host "`n现在可以运行: npm run dev" -ForegroundColor Cyan
