#!/bin/bash

echo "*************************************** Starting GenericDashBoard **************************************"


echo "*** installing dependencies ***"
echo "please wait ..."

npm rebuild

npm install


pip install web3
pip install pymongo
pip install apscheduler


echo "*************** Required modules installed **********"
echo "Run SyncBlockData.py to start syncing blocks "
echo "Run app.js for GenericDashBoard "
echo "Check index.html in out directory for API endpoints documentation"


