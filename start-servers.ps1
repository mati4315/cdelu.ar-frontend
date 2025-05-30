# Script para ejecutar el servidor mock y el frontend
Write-Host "Iniciando servidores..." -ForegroundColor Green

# Ejecutar servidor mock en segundo plano
Write-Host "Iniciando servidor mock en puerto 3001..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "mock-server.js" -WindowStyle Minimized

# Esperar un momento para que el servidor mock se inicie
Start-Sleep -Seconds 2

# Ejecutar frontend
Write-Host "Iniciando frontend en puerto 5174..." -ForegroundColor Yellow
npm run dev 