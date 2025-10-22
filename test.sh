#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}KYC Application Test Suite${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
curl -s ${BASE_URL}/health | jq '.'
echo ""

# Test 2: Create KYC Session
echo -e "${BLUE}Test 2: Create KYC Session${NC}"
SESSION_RESPONSE=$(curl -s -X POST ${BASE_URL}/kyc/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "email": "test@example.com",
    "locale": "en",
    "country": "PK"
  }')

echo "$SESSION_RESPONSE" | jq '.'
REFERENCE=$(echo "$SESSION_RESPONSE" | jq -r '.reference')
echo ""

# Test 3: Get Session Details
if [ "$REFERENCE" != "null" ] && [ -n "$REFERENCE" ]; then
  echo -e "${BLUE}Test 3: Get Session Details (Reference: $REFERENCE)${NC}"
  curl -s ${BASE_URL}/kyc/session/${REFERENCE} | jq '.'
  echo ""

  # Test 4: Mock Webhook
  echo -e "${BLUE}Test 4: Mock Webhook (Accepted Status)${NC}"
  curl -s -X POST ${BASE_URL}/kyc/webhook \
    -H "Content-Type: application/json" \
    -d "{
      \"reference\": \"${REFERENCE}\",
      \"event\": \"verification.accepted\",
      \"response\": {
        \"verification_data\": {
          \"document\": {
            \"name\": {
              \"full_name\": \"Ali Raza Khan\"
            },
            \"country\": \"PAK\"
          }
        }
      }
    }" | jq '.'
  echo ""

  # Test 5: Check Updated Status
  echo -e "${BLUE}Test 5: Check Updated Status${NC}"
  curl -s ${BASE_URL}/kyc/session/${REFERENCE} | jq '.session.status'
  echo ""
fi

# Test 6: Admin Override
echo -e "${BLUE}Test 6: Admin Override${NC}"
curl -s -X POST ${BASE_URL}/kyc/admin/override \
  -H "Content-Type: application/json" \
  -d "{
    \"reference\": \"${REFERENCE}\",
    \"status\": \"review\"
  }" | jq '.'
echo ""

# Test 7: Debug Extract
echo -e "${BLUE}Test 7: Debug Extract Verification Data${NC}"
curl -s -X POST ${BASE_URL}/kyc/debug/extract \
  -H "Content-Type: application/json" \
  -d '{
    "response": {
      "verification_data": {
        "document": {
          "name": {
            "full_name": "Muhammad Ali Hassan"
          },
          "country": "PAK"
        }
      }
    }
  }' | jq '.'
echo ""

# Test 8: Get User Sessions
echo -e "${BLUE}Test 8: Get All User Sessions${NC}"
curl -s ${BASE_URL}/kyc/user/test_user_123/sessions | jq '.sessions | length'
echo ""

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}==================================${NC}"
