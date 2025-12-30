# Frontend-Backend Integration Test Script (Windows PowerShell)
# Tests API connectivity and basic functionality

Write-Host "🔍 HR Portal Frontend-Backend Integration Test" -ForegroundColor Cyan
Write-Host "=============================================="
Write-Host ""

$BackendUrl = "http://localhost:5000"
$ApiUrl = "$BackendUrl/api"
$Token = ""

# Test 1: Health Check
Write-Host "[Test 1] Checking Backend Health..." -ForegroundColor Yellow
try {
    $HealthResponse = Invoke-WebRequest -Uri "$BackendUrl/health" -Method Get -UseBasicParsing
    if ($HealthResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: CORS Check
Write-Host "[Test 2] Checking CORS Configuration..." -ForegroundColor Yellow
try {
    $CorsResponse = Invoke-WebRequest -Uri "$ApiUrl/auth/me" `
        -Method Get `
        -Headers @{
            "Origin" = "http://localhost:5173"
            "Access-Control-Request-Method" = "GET"
        } `
        -UseBasicParsing
    
    if ($CorsResponse.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "✅ CORS is properly configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  CORS headers might not be configured" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Could not check CORS headers" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: MongoDB Connection
Write-Host "[Test 3] Checking MongoDB Connection..." -ForegroundColor Yellow
try {
    $TestPayload = @{
        username = "integration_test"
        email = "test@integration.local"
        password = "test123456"
    } | ConvertTo-Json
    
    $TestResponse = Invoke-WebRequest -Uri "$ApiUrl/auth/register" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $TestPayload `
        -UseBasicParsing
    
    $TestContent = $TestResponse.Content | ConvertFrom-Json
    if ($TestContent.success -or $TestContent.message -like "*already exists*") {
        Write-Host "✅ MongoDB is connected" -ForegroundColor Green
    }
}
catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400 -and $_.ErrorDetails.Message -like "*already exists*") {
        Write-Host "✅ MongoDB is connected (user already exists)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ MongoDB connection issue" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Authentication Flow
Write-Host "[Test 4] Testing Authentication Flow..." -ForegroundColor Yellow
try {
    $LoginPayload = @{
        email = "admin@hr-portal.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $LoginResponse = Invoke-WebRequest -Uri "$ApiUrl/auth/login" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $LoginPayload `
        -UseBasicParsing
    
    $LoginContent = $LoginResponse.Content | ConvertFrom-Json
    
    if ($LoginContent.data.token) {
        Write-Host "✅ Authentication working" -ForegroundColor Green
        $Token = $LoginContent.data.token
        Write-Host "Token obtained: $($Token.Substring(0, 20))..." -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️  Could not authenticate" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Could not authenticate (user may not exist in DB)" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Protected Routes (if token exists)
if ($Token) {
    Write-Host "[Test 5] Testing Protected Routes..." -ForegroundColor Yellow
    try {
        $ProtectedResponse = Invoke-WebRequest -Uri "$ApiUrl/employees" `
            -Method Get `
            -Headers @{
                "Authorization" = "Bearer $Token"
                "Content-Type" = "application/json"
            } `
            -UseBasicParsing
        
        $ProtectedContent = $ProtectedResponse.Content | ConvertFrom-Json
        if ($ProtectedContent.success -or $ProtectedContent.data) {
            Write-Host "✅ Protected routes are working" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Protected routes failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Protected routes failed" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 6: API Response Format
Write-Host "[Test 6] Checking API Response Format..." -ForegroundColor Yellow
try {
    $HealthResponse = Invoke-WebRequest -Uri "$BackendUrl/health" -Method Get -UseBasicParsing
    $HealthContent = $HealthResponse.Content | ConvertFrom-Json
    
    if ($HealthContent.status) {
        Write-Host "✅ API response format is correct" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  API response format might be different" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=============================================="
Write-Host "✅ Integration Test Complete" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Notes:" -ForegroundColor Cyan
Write-Host "  - Backend should be running on http://localhost:5000"
Write-Host "  - Frontend should be running on http://localhost:5173"
Write-Host "  - MongoDB should be running on localhost:27017"
Write-Host "  - Check .env files for correct configuration"
Write-Host ""
