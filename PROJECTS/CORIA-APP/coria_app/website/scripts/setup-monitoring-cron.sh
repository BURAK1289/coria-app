#!/bin/bash

# Setup monitoring cron jobs for CORIA website
# This script configures automated monitoring checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_SCRIPT="$SCRIPT_DIR/monitoring.sh"

echo "Setting up CORIA website monitoring cron jobs..."

# Check if monitoring script exists and is executable
if [ ! -x "$MONITORING_SCRIPT" ]; then
    echo "Error: Monitoring script not found or not executable: $MONITORING_SCRIPT"
    exit 1
fi

# Create cron jobs
CRON_JOBS="
# CORIA Website Monitoring
# Full monitoring check every 5 minutes
*/5 * * * * $MONITORING_SCRIPT >/dev/null 2>&1

# Health check every minute
* * * * * $MONITORING_SCRIPT health >/dev/null 2>&1

# SSL certificate check daily at 6 AM
0 6 * * * $MONITORING_SCRIPT ssl >/dev/null 2>&1

# Performance check every 15 minutes
*/15 * * * * $MONITORING_SCRIPT performance >/dev/null 2>&1

# Dependencies check every 30 minutes
*/30 * * * * $MONITORING_SCRIPT dependencies >/dev/null 2>&1
"

# Add cron jobs to current user's crontab
echo "Adding monitoring cron jobs..."
(crontab -l 2>/dev/null || echo "") | grep -v "CORIA Website Monitoring" | grep -v "$MONITORING_SCRIPT" > /tmp/crontab.tmp
echo "$CRON_JOBS" >> /tmp/crontab.tmp
crontab /tmp/crontab.tmp
rm /tmp/crontab.tmp

echo "✅ Monitoring cron jobs installed successfully"

# Display current cron jobs
echo ""
echo "Current cron jobs:"
crontab -l | grep -A 20 "CORIA Website Monitoring" || echo "No CORIA monitoring jobs found"

# Create systemd service for more robust monitoring (optional)
create_systemd_service() {
    local service_file="/etc/systemd/system/coria-monitoring.service"
    local timer_file="/etc/systemd/system/coria-monitoring.timer"
    
    echo "Creating systemd service for monitoring..."
    
    # Create service file
    sudo tee "$service_file" > /dev/null << EOF
[Unit]
Description=CORIA Website Monitoring
After=network.target

[Service]
Type=oneshot
ExecStart=$MONITORING_SCRIPT
User=$(whoami)
Group=$(whoami)

[Install]
WantedBy=multi-user.target
EOF

    # Create timer file
    sudo tee "$timer_file" > /dev/null << EOF
[Unit]
Description=Run CORIA Website Monitoring every 5 minutes
Requires=coria-monitoring.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

    # Enable and start the timer
    sudo systemctl daemon-reload
    sudo systemctl enable coria-monitoring.timer
    sudo systemctl start coria-monitoring.timer
    
    echo "✅ Systemd service and timer created and started"
}

# Ask if user wants to create systemd service (for production servers)
if [ "$1" = "--systemd" ]; then
    create_systemd_service
fi

echo ""
echo "Monitoring setup complete!"
echo ""
echo "To test the monitoring script manually:"
echo "  $MONITORING_SCRIPT"
echo ""
echo "To view monitoring logs:"
echo "  tail -f /tmp/coria-monitoring-\$(date +%Y%m%d).log"
echo ""
echo "To remove monitoring cron jobs:"
echo "  crontab -e  # and remove the CORIA Website Monitoring section"