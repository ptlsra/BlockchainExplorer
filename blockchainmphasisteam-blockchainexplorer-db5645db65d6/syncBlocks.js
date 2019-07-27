var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var Web3 = require('web3');
const dboper = require('mongooperations');

var web3Provider;
var mongoUrl;
var databaseName;
var web3;
var mongoClient;
var newBlockAvailable;
//var jobStatus = true;
var executeSyncBlockchainData = true;






var syncBlockchainData = () => {
    const db = mongoClient.db(databaseName);
    var previousBlockHeight = 0;
    var nextBlockNumber;
    newBlocksAvailable = true;
    //get block height
    var latestBlockHeight = web3.eth.blockNumber;
    
    //get previous chain_info
    dboper.findDocuments(db, "chain_info").then((result) => {
        //console.log(result);
        if(result.length == 0){
            previousBlockHeight = 0;
        }else{
            previousBlockHeight = result[0].blockHeight;
        }
        if(previousBlockHeight > latestBlockHeight){
            throw new Error('Error : database data invalid, previous blockheight is invalid : ',previousBlockHeight);
        }

        if(previousBlockHeight == latestBlockHeight){
            newBlockAvailable = false;
            //jobStatus = true;
            throw new Error("PreviousBlockHeight in chain_info is : "+previousBlockHeight+"  Waiting for new blocks ...");
        }
        nextBlockNumber =  previousBlockHeight+1;
    })
    .then(() => {

        //get contract addresses from contracts collection
        return dboper.findDocuments(db, "contracts");
    })
    .then((result) => {
        //console.log("PreviousBlockHeight is : "+previousBlockHeight+"  Waiting for new blocks ...")
        //console.log("Latest blockheight is: ", latestBlockHeight);
        //console.log("PreviousBlockHeight: "+previousBlockHeight);
        console.log("downloading block: ", nextBlockNumber)
        //get contract transactions
        var blockData = web3.eth.getBlock(nextBlockNumber);
        var txList = blockData.transactions;
        var timestamp = blockData.timestamp;
        var blockNumber = blockData.number;
        var contractTransactionList = [];
        for(let index = 0; index < txList.length; index++){

            //get to address from txData
            var txData = web3.eth.getTransaction(txList[index]);
            var toAddress = txData.to;

            //check for contract transactions
            for(let contractColIndex = 0 ; contractColIndex < result.length; contractColIndex++){
                if (toAddress == result[contractColIndex].contractAddress){
                    var contractObject = {
                        "tx_id":txList[index],
                        "contractAddress":toAddress,
                        "timestamp":timestamp,
                        "blockNumber":blockNumber
                    }

                    contractTransactionList.push(contractObject);
                }
            }
        }

        //insert contractTransactionList
        if(contractTransactionList.length == 0){
            return 0;
        }else{
            return dboper.insertManyDocuments(db, contractTransactionList, "contract_txns");
        }
    })
    .then((result) => {

        //insert transaction data
        var block_data = web3.eth.getBlock(nextBlockNumber);
        var txObject = {
            "tx_id":block_data.transactions.length,
            "timeStamp":block_data.timestamp,
            "blockNumber":block_data.number
        }

        return dboper.insertDocument(db, txObject, "transactions");
    })
    .then((result) => {

        //insert block data 
        var blockData = web3.eth.getBlock(nextBlockNumber);
        var blockObject = {
            "blockNumber":blockData.number,
            "blockHash":blockData.hash,
            "timeStamp":blockData.timestamp,
            "txCount":blockData.transactions.length
        }

        return dboper.insertDocument(db, blockObject, "blocks");
    })
    .then((result) => {
        //update chain_info
        return dboper.updateDocument(db, {"id":"chaininfo"}, {"blockHeight":nextBlockNumber},"chain_info");
    })
    .then((result) => {
        executeSyncBlockchainData = true;
    })
    .catch((err) => {
        if(err.message != ""){
            console.log(err.message);
        }
    });
};


var startBlockSyncScheduler = () => {
    setInterval(() => {
        if (executeSyncBlockchainData == true){
            syncBlockchainData();

            // Set next execution as false, Will set by filter event / syncBlockchainData after successfull execution
            executeSyncBlockchainData = false;
        }
    }, 10);
};


exports.startSyncBlockchainData = (web3Url, mongoIp, mongoPort, mongoDatabaseName) => {
    web3Provider = web3Url;
    mongoUrl = "mongodb://"+mongoIp+":"+mongoPort;
    console.log("printing mongoUrl : "+mongoUrl);
    databaseName = mongoDatabaseName;

    //connect to web3 provider
    web3 = new Web3(new Web3.providers.HttpProvider(web3Url));
    
    //Connect to database
    MongoClient.connect(mongoUrl).then((client) => {
        console.log("Connected correctly to the mongodb server");
        mongoClient = client;
      
        var tempdb = mongoClient.db(databaseName);

        //start blockSyncScheduler
        console.log("checking chain_info");
        dboper.findDocuments(tempdb, "chain_info").then((result) => {
            if (result.length == 0){
                console.log("creating chain_info ");
                var chainObject = {
                    "id":"chaininfo",
                    "blockHeight":0
                }
                return dboper.insertDocument(tempdb, chainObject, "chain_info");
            }else{
                console.log("chain_info already created ");
                return;
            }
        })
        .then((result) =>{
            console.log("\nStarting blockSyncScheduler: ");
            console.log("Downloading blocks ...");
            startBlockSyncScheduler();
        })
        .catch((err) => {
            console.log(err);
        });

    })
    .catch((err) => console.log("Error : " + err));


    var filter = web3.eth.filter('latest');

    //Start the block event
    filter.watch(function (error, result) {
        if(error){
            throw new Error("Error in event filter");
        }
        var block = web3.eth.getBlock(result, true);
        console.log('New block created : ' + block.number);
        executeSyncBlockchainData = true;
    });
}