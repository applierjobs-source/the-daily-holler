#!/bin/bash

# Setup Daily News Generation Cron Job (Cost-Effective Version)
# This script sets up a cron job to run the daily news generator every day at 4:25 PM CDT
# Generates only 10 new articles per day but distributes them to all cities

echo "🚀 Setting up Cost-Effective Daily News Generation Cron Job"
echo "============================================================"

# Get the current directory (where the script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAILY_SCRIPT="$SCRIPT_DIR/daily-news-generator.js"
NODE_PATH=$(which node)

echo "📁 Script directory: $SCRIPT_DIR"
echo "📄 Daily script: $DAILY_SCRIPT"
echo "🟢 Node.js path: $NODE_PATH"

# Check if the daily script exists
if [ ! -f "$DAILY_SCRIPT" ]; then
    echo "❌ Error: Daily news generator script not found at $DAILY_SCRIPT"
    exit 1
fi

# Check if node is available
if [ -z "$NODE_PATH" ]; then
    echo "❌ Error: Node.js not found in PATH"
    exit 1
fi

# Create the cron job entry (runs every day at 4:25 PM CDT)
CRON_ENTRY="25 16 * * * cd $SCRIPT_DIR && $NODE_PATH $DAILY_SCRIPT >> $SCRIPT_DIR/daily-news.log 2>&1"

echo ""
echo "📅 Cron job will run: Every day at 4:25 PM CDT"
echo "📝 Command: $CRON_ENTRY"
echo "💰 Cost: ~$3-5 per day (10 articles × 1,682 cities = 16,820 total articles)"
echo ""

# Add the cron job
echo "Adding cron job..."
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job added successfully!"
    echo ""
    echo "📋 Current cron jobs:"
    crontab -l
    echo ""
    echo "📝 Logs will be written to: $SCRIPT_DIR/daily-news.log"
    echo ""
    echo "💰 Cost Analysis:"
    echo "   - 10 new articles per day"
    echo "   - Each article distributed to 1,682 cities"
    echo "   - Total: 16,820 new city articles per day"
    echo "   - Estimated cost: $3-5 per day"
    echo "   - Monthly cost: ~$90-150"
    echo ""
    echo "🔧 To remove the cron job later, run:"
    echo "   crontab -e"
    echo "   (then delete the line with daily-news-generator.js)"
    echo ""
    echo "📊 To test the script manually, run:"
    echo "   cd $SCRIPT_DIR && $NODE_PATH $DAILY_SCRIPT"
else
    echo "❌ Failed to add cron job"
    exit 1
fi
