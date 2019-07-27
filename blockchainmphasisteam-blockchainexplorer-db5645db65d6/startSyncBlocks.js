var syncBlocks = require('./syncBlocks');
var fs = require('fs');

var rawData = fs.readFileSync('appConfig.json');
var jsonData = JSON.parse(rawData);

console.log(jsonData.web3Provider);
console.log(jsonData.mongoDBIp);
console.log(jsonData.mongoDBPort);
console.log(jsonData.database_name);

var web3_provider = "http://localhost:22002"
var mongoDBIp = jsonData.mongoDBIp;
var mongoDbPort = jsonData.mongoDBPort;
var database_name = jsonData.database_name;

syncBlocks.startSyncBlockchainData(web3_provider, mongoDBIp, mongoDbPort, database_name);
