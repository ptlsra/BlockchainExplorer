#!/bin/bash

# starting sync api

echo "Updating config.json file"

node updateConfig.js $RPC_IP $RPC_PORT $MONGO_IP $MONGO_PORT $NODE_NAME $API_PORT $DATABASE_NAME

#forever start -o /api-logs/syncAPI.log testSyncBlocks.js
#node startSyncBlocks.js |& tee -a /api-logs/syncblocks-api.log

# starting express server
node app.js |& tee -a /api-logs/explorer-api.log
