#!/bin/bash

# Smoke tests for post-deployment verification
# Run after production deployment to verify critical flows

set -e

BASE_URL="${BASE_URL:-https://equalityvanguard.org}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"

echo "🚀 Running smoke tests against ${BASE_URL}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test an endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=${5:-200}

  echo -n "Testing ${name}... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}${url}")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${url}" \
      -H "Content-Type: application/json" \
      -d "${data}")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAILED (HTTP ${http_code})${NC}"
    echo "Response: $body"
    ((FAILED++))
    return 1
  fi
}

# Test 1: Homepage loads
test_endpoint "Homepage" "GET" "/" "" 200

# Test 2: API health check (if available)
test_endpoint "API Health" "GET" "/api/health" "" 200 || echo -e "${YELLOW}⚠ Health endpoint not available${NC}"

# Test 3: Events page loads
test_endpoint "Events Page" "GET" "/events" "" 200

# Test 4: Publications page loads
test_endpoint "Publications Page" "GET" "/matri-archive" "" 200

# Test 5: Newsletter subscribe (validation test)
test_endpoint "Newsletter Validation" "POST" "/api/newsletter/subscribe" \
  '{"email":"invalid-email","name":"Test"}' 400

# Test 6: Contact form validation
test_endpoint "Contact Form Validation" "POST" "/api/contact" \
  '{"name":"Test","email":"invalid","subject":"Test","message":"Test"}' 400

# Test 7: Admin login page (should redirect or show login)
test_endpoint "Admin Login Page" "GET" "/admin/login" "" 200

# Summary
echo ""
echo "=========================================="
echo "Smoke Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All smoke tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some smoke tests failed${NC}"
  exit 1
fi
