# Quick CURL Test for Email
# Send to: saifamjad006@gmail.com

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Quick Email Test via CURL" -ForegroundColor Cyan  
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nTarget: saifamjad006@gmail.com`n" -ForegroundColor Yellow

# Login
Write-Host "Step 1: Getting auth token..." -ForegroundColor Green
$login = curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}' `
  --silent

$loginJson = $login | ConvertFrom-Json
$token = $loginJson.token

if ($token) {
    Write-Host "SUCCESS: Token obtained`n" -ForegroundColor Green
    
    # Create employee
    Write-Host "Step 2: Creating employee and sending email..." -ForegroundColor Green
    
    $result = curl.exe -X POST http://localhost:5000/api/employees `
      -H "Content-Type: application/json" `
      -H "Authorization: Bearer $token" `
      -d '{\"firstName\":\"Saif\",\"lastName\":\"Amjad\",\"email\":\"saifamjad006@gmail.com\",\"phone\":\"+92-300-1234567\",\"employeeCode\":\"CURL-TEST-001\",\"gender\":\"Male\",\"position\":\"Test Engineer\",\"department\":\"Engineering\",\"salary\":75000,\"joiningDate\":\"2026-01-24\",\"status\":\"Active\"}' `
      --silent
    
    Write-Host "`nRESPONSE:" -ForegroundColor Cyan
    Write-Host $result -ForegroundColor White
    
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host "Check saifamjad006@gmail.com for welcome email!" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "FAILED: Could not login" -ForegroundColor Red
    Write-Host "Response: $login" -ForegroundColor Yellow
}
