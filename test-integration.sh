#!/bin/bash

# Frontend-Backend Integration Test Script
# Tests API connectivity and basic functionality

echo "🔍 HR Portal Frontend-Backend Integration Test"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:5000"
API_URL="${BACKEND_URL}/api"

# Test 1: Health Check
echo -e "${YELLOW}[Test 1] Checking Backend Health...${NC}"
HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health")
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: CORS Check
echo -e "${YELLOW}[Test 2] Checking CORS Configuration...${NC}"
CORS_RESPONSE=$(curl -s -i "${API_URL}/auth/me" \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: GET" 2>&1)
if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS is properly configured${NC}"
else
    echo -e "${YELLOW}⚠️  CORS headers might not be configured${NC}"
fi
echo ""

# Test 3: MongoDB Connection
echo -e "${YELLOW}[Test 3] Checking MongoDB Connection...${NC}"
# Try to create a test user
TEST_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "integration_test",
        "email": "test@integration.local",
        "password": "test123456"
    }')

if echo "$TEST_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ MongoDB is connected${NC}"
elif echo "$TEST_RESPONSE" | grep -q "already exists"; then
    echo -e "${GREEN}✅ MongoDB is connected (user already exists)${NC}"
else
    echo -e "${RED}❌ MongoDB connection issue${NC}"
    echo "Response: $TEST_RESPONSE"
fi
echo ""

# Test 4: Authentication Flow
echo -e "${YELLOW}[Test 4] Testing Authentication Flow...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@hr-portal.com",
        "password": "admin123"
    }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Authentication working${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token obtained: ${TOKEN:0:20}..."
else
    echo -e "${YELLOW}⚠️  Could not authenticate (user may not exist in DB)${NC}"
    echo "Response: $LOGIN_RESPONSE"
    TOKEN=""
fi
echo ""

# Test 5: Protected Routes (if token exists)
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}[Test 5] Testing Protected Routes...${NC}"
    PROTECTED_RESPONSE=$(curl -s -X GET "${API_URL}/employees" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json")
    
    if echo "$PROTECTED_RESPONSE" | grep -q "success\|data"; then
        echo -e "${GREEN}✅ Protected routes are working${NC}"
    else
        echo -e "${RED}❌ Protected routes failed${NC}"
        echo "Response: $PROTECTED_RESPONSE"
    fi
    echo ""
fi

# Test 6: API Response Format
echo -e "${YELLOW}[Test 6] Checking API Response Format...${NC}"
if echo "$PROTECTED_RESPONSE" | grep -q '"success"'; then
    echo -e "${GREEN}✅ API response format is correct${NC}"
else
    echo -e "${YELLOW}⚠️  API response format might be different${NC}"
fi
echo ""

echo "=============================================="
echo -e "${GREEN}✅ Integration Test Complete${NC}"
echo ""
echo "📌 Notes:"
echo "  - Backend should be running on http://localhost:5000"
echo "  - Frontend should be running on http://localhost:5173"
echo "  - MongoDB should be running on localhost:27017"
echo "  - Check .env files for correct configuration"
echo ""
