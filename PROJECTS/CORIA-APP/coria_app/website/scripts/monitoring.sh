#!/bin/bash

# CORIA Website Monitoring Script
# This script performs various monitoring checks and sends alerts if issues are detected

set -e

# Configuration
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://coria.app}"
HEALTH_ENDPOINT="$SITE_URL/api/health"
ALERT_EMAIL="${ALERT_EMAIL:-admin@coria.app}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL}"
LOG_FILE="/tmp/coria-monitoring.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send alert function
send_alert() {
    local severity=$1
    local message=$2
    local details=$3
    
    log "ALERT [$severity]: $message"
    
    # Send to Slack if webhook is configured
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 CORIA Website Alert [$severity]: $message\", \"attachments\":[{\"color\":\"danger\",\"text\":\"$details\"}]}" \
            "$SLACK_WEBHOOK" 2>/dev/null || log "Failed to send Slack alert"
    fi
    
    # Log to syslog
    logger -t "coria-monitoring" "[$severity] $message: $details"
}

# Check website availability
check_availability() {
    log "Checking website availability..."
    
    local response_code
    local response_time
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$SITE_URL")
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 30 "$SITE_URL")
    
    if [ "$response_code" != "200" ]; then
        send_alert "CRITICAL" "Website unavailable" "HTTP $response_code from $SITE_URL"
        return 1
    fi
    
    # Check response time (alert if > 5 seconds)
    if (( $(echo "$response_time > 5.0" | bc -l) )); then
        send_alert "WARNING" "Slow response time" "Response time: ${response_time}s from $SITE_URL"
    fi
    
    log "✅ Website available (${response_code}, ${response_time}s)"
    return 0
}

# Check health endpoint
check_health() {
    log "Checking health endpoint..."
    
    local health_response
    local health_status
    
    health_response=$(curl -s --max-time 10 "$HEALTH_ENDPOINT" || echo '{"status":"error"}')
    health_status=$(echo "$health_response" | jq -r '.status' 2>/dev/null || echo "error")
    
    case "$health_status" in
        "healthy")
            log "✅ Health check passed"
            return 0
            ;;
        "degraded")
            send_alert "WARNING" "Service degraded" "Health check returned: $health_response"
            return 1
            ;;
        *)
            send_alert "CRITICAL" "Health check failed" "Health check returned: $health_response"
            return 1
            ;;
    esac
}

# Check SSL certificate
check_ssl() {
    log "Checking SSL certificate..."
    
    local domain
    local expiry_date
    local days_until_expiry
    
    domain=$(echo "$SITE_URL" | sed 's|https\?://||' | sed 's|/.*||')
    
    expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | \
                  openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    if [ -n "$expiry_date" ]; then
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ "$days_until_expiry" -lt 7 ]; then
            send_alert "CRITICAL" "SSL certificate expiring soon" "Certificate expires in $days_until_expiry days"
        elif [ "$days_until_expiry" -lt 30 ]; then
            send_alert "WARNING" "SSL certificate expiring" "Certificate expires in $days_until_expiry days"
        fi
        
        log "✅ SSL certificate valid ($days_until_expiry days remaining)"
    else
        send_alert "CRITICAL" "SSL certificate check failed" "Could not retrieve certificate information"
        return 1
    fi
}

# Check DNS resolution
check_dns() {
    log "Checking DNS resolution..."
    
    local domain
    local dns_result
    
    domain=$(echo "$SITE_URL" | sed 's|https\?://||' | sed 's|/.*||')
    dns_result=$(dig +short "$domain" | head -1)
    
    if [ -z "$dns_result" ]; then
        send_alert "CRITICAL" "DNS resolution failed" "Could not resolve $domain"
        return 1
    fi
    
    log "✅ DNS resolution successful ($domain -> $dns_result)"
    return 0
}

# Check critical pages
check_critical_pages() {
    log "Checking critical pages..."
    
    local pages=(
        "/"
        "/tr"
        "/en"
        "/tr/features"
        "/tr/pricing"
        "/api/health"
        "/sitemap.xml"
    )
    
    local failed_pages=()
    
    for page in "${pages[@]}"; do
        local url="$SITE_URL$page"
        local response_code
        
        response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url")
        
        if [ "$response_code" != "200" ]; then
            failed_pages+=("$page (HTTP $response_code)")
            log "❌ Page check failed: $page (HTTP $response_code)"
        else
            log "✅ Page check passed: $page"
        fi
    done
    
    if [ ${#failed_pages[@]} -gt 0 ]; then
        local failed_list=$(IFS=', '; echo "${failed_pages[*]}")
        send_alert "CRITICAL" "Critical pages unavailable" "Failed pages: $failed_list"
        return 1
    fi
    
    return 0
}

# Check external dependencies
check_dependencies() {
    log "Checking external dependencies..."
    
    local dependencies=(
        "https://cdn.contentful.com"
        "https://www.google-analytics.com"
        "https://fonts.googleapis.com"
    )
    
    local failed_deps=()
    
    for dep in "${dependencies[@]}"; do
        local response_code
        
        response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$dep" || echo "000")
        
        if [ "$response_code" = "000" ] || [ "$response_code" -ge "500" ]; then
            failed_deps+=("$dep (HTTP $response_code)")
            log "❌ Dependency check failed: $dep (HTTP $response_code)"
        else
            log "✅ Dependency check passed: $dep"
        fi
    done
    
    if [ ${#failed_deps[@]} -gt 0 ]; then
        local failed_list=$(IFS=', '; echo "${failed_deps[*]}")
        send_alert "WARNING" "External dependencies unavailable" "Failed dependencies: $failed_list"
        return 1
    fi
    
    return 0
}

# Performance check
check_performance() {
    log "Checking performance metrics..."
    
    local load_time
    local size
    
    # Measure page load time and size
    load_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 30 "$SITE_URL")
    size=$(curl -s -w "%{size_download}" --max-time 30 "$SITE_URL" | tail -1)
    
    # Alert if load time > 3 seconds
    if (( $(echo "$load_time > 3.0" | bc -l) )); then
        send_alert "WARNING" "Slow page load time" "Load time: ${load_time}s, Size: ${size} bytes"
    fi
    
    log "✅ Performance check completed (${load_time}s, ${size} bytes)"
}

# Main monitoring function
run_monitoring() {
    log "Starting CORIA website monitoring..."
    
    local exit_code=0
    
    # Run all checks
    check_availability || exit_code=1
    check_health || exit_code=1
    check_ssl || exit_code=1
    check_dns || exit_code=1
    check_critical_pages || exit_code=1
    check_dependencies || exit_code=1
    check_performance
    
    if [ $exit_code -eq 0 ]; then
        log "✅ All monitoring checks passed"
    else
        log "❌ Some monitoring checks failed"
        send_alert "WARNING" "Monitoring checks completed with failures" "Check log file: $LOG_FILE"
    fi
    
    log "Monitoring completed"
    return $exit_code
}

# Cleanup old logs (keep last 7 days)
cleanup_logs() {
    find /tmp -name "coria-monitoring-*.log" -mtime +7 -delete 2>/dev/null || true
}

# Main execution
main() {
    # Check dependencies
    command -v curl >/dev/null 2>&1 || { echo "curl is required but not installed. Aborting." >&2; exit 1; }
    command -v jq >/dev/null 2>&1 || { echo "jq is required but not installed. Aborting." >&2; exit 1; }
    command -v openssl >/dev/null 2>&1 || { echo "openssl is required but not installed. Aborting." >&2; exit 1; }
    command -v dig >/dev/null 2>&1 || { echo "dig is required but not installed. Aborting." >&2; exit 1; }
    command -v bc >/dev/null 2>&1 || { echo "bc is required but not installed. Aborting." >&2; exit 1; }
    
    # Create log file with timestamp
    LOG_FILE="/tmp/coria-monitoring-$(date +%Y%m%d).log"
    
    # Run monitoring
    run_monitoring
    local result=$?
    
    # Cleanup old logs
    cleanup_logs
    
    exit $result
}

# Handle script arguments
case "${1:-}" in
    "availability")
        check_availability
        ;;
    "health")
        check_health
        ;;
    "ssl")
        check_ssl
        ;;
    "dns")
        check_dns
        ;;
    "pages")
        check_critical_pages
        ;;
    "dependencies")
        check_dependencies
        ;;
    "performance")
        check_performance
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [availability|health|ssl|dns|pages|dependencies|performance]"
        echo "Run without arguments to perform all checks"
        exit 1
        ;;
esac