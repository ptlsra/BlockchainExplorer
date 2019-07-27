#!/bin/bash

echo "Saving configuration file ..."
#echo $WEB3
#echo -e 'web3Provider=${WEB3}\nmongoIp=${MONGOIP}\nmongoPort=${MONGO_PORT}' > .env
#source .env
#cat .env

#python EthereumSync.py |& tee -a >> ./logs/syncAPI.log
#echo $WEB3
python3 EthereumSync.py |& tee -a >> /api-logs/pythonsyncAPI.log