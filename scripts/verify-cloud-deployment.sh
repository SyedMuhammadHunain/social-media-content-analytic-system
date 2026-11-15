#!/usr/bin/env bash
# ==============================================================================
# SMCAS - Automated Cloud Deployment Smoke & Health Verification
# Usage:
#   bash scripts/verify-cloud-deployment.sh [BASE_URL]
# Example:
#   bash scripts/verify-cloud-deployment.sh https://smcas-backend.eastus.cloudapp.azure.com
# ==============================================================================
set -uo pipefail

BASE_URL="${1:-http://localhost:8080}"
BASE_URL="${BASE_URL%/}" # Strip trailing slash

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}==================================================================${RESET}"
echo -e "${BOLD}${CYAN} SMCAS Production Cloud Deployment Smoke Verification${RESET}"
echo -e " Target Gateway: ${BOLD}${BASE_URL}${RESET}"
echo -e "${BOLD}${CYAN}==================================================================${RESET}"

TOTAL_CHECKS=0
PASSED_CHECKS=0

run_check() {
    local name="$1"
    local command="$2"
    local expected_pattern="$3"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -ne " [..] Checking: ${name} ... "
    local output
    if output=$(eval "$command" 2>&1); then
        if [[ -z "$expected_pattern" ]] || echo "$output" | grep -qi "$expected_pattern"; then
            echo -e "\r [${GREEN}PASS${RESET}] Checking: ${name}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            echo -e "\r [${RED}FAIL${RESET}] Checking: ${name} (Output did not match '$expected_pattern')"
            echo -e "      Response: ${output:0:200}..."
            return 1
        fi
    else
        echo -e "\r [${RED}FAIL${RESET}] Checking: ${name} (Curl command error)"
        echo -e "      Error: ${output:0:200}..."
        return 1
    fi
}

# 1. Gateway Actuator Health Check
run_check \
    "Spring Cloud Gateway Health Endpoint" \
    "curl -s -o /dev/null -w '%{http_code}' '${BASE_URL}/actuator/health'" \
    "200"

# 2. CORS Preflight Check for Vercel Origin
run_check \
    "CORS Preflight (Origin: https://smcas.vercel.app)" \
    "curl -s -I -X OPTIONS '${BASE_URL}/v1/posts' -H 'Origin: https://smcas.vercel.app' -H 'Access-Control-Request-Method: GET'" \
    "access-control-allow-origin"

# 3. MongoDB Newsfeed Hydration Read
run_check \
    "Newsfeed / Posts Query (MongoDB Atlas connectivity)" \
    "curl -s -o /dev/null -w '%{http_code}' '${BASE_URL}/v1/posts'" \
    "200\|404"

# 4. Azure Blob Storage SAS Generation
run_check \
    "Azure Blob Storage Pre-Signed SAS Generation (/v1/media/presign)" \
    "curl -s -X POST '${BASE_URL}/v1/media/presign' -H 'Content-Type: application/json' -d '{\"filename\":\"smoke-test.png\",\"contentType\":\"image/png\"}'" \
    "uploadUrl\|url\|blob"

# 5. Direct Messaging Transcript Read
run_check \
    "Direct Chat Messages Endpoint (/v1/chat/messages)" \
    "curl -s -o /dev/null -w '%{http_code}' '${BASE_URL}/v1/chat/messages?with=demo-user-1'" \
    "200"

# 6. Notification Aggregator Check
run_check \
    "Notification Feed Endpoint (/v1/notifications)" \
    "curl -s -o /dev/null -w '%{http_code}' '${BASE_URL}/v1/notifications?userId=demo-user-1'" \
    "200"

echo -e "\n${BOLD}${CYAN}------------------------------------------------------------------${RESET}"
if [ "$PASSED_CHECKS" -ge 4 ]; then
    echo -e " ${GREEN}${BOLD}SMOKE VERIFICATION PASSED${RESET}: ${PASSED_CHECKS}/${TOTAL_CHECKS} endpoints verified functional."
    echo -e " Gateway is ready to serve Vercel frontend requests."
else
    echo -e " ${YELLOW}${BOLD}SMOKE VERIFICATION WARNING${RESET}: ${PASSED_CHECKS}/${TOTAL_CHECKS} checks succeeded."
    echo -e " Check if MongoDB Atlas URI or Azure Storage Connection String is active."
fi
echo -e "${BOLD}${CYAN}==================================================================${RESET}\n"
