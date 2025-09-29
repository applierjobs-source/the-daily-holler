#!/bin/bash

# Kill any existing Node.js processes
pkill -f "node.*index.js"

# Navigate to server directory
cd /Users/Developer2/indiesage/server

# Start the server
npm start

