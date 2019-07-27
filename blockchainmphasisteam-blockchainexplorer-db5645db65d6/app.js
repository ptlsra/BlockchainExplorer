// required libraries
var fs = require("fs");
// Web3 configured later according to the selection in dashboard
var Web3 = require('web3-quorum');;
var web3;
var EthWeb3 = require('web3');
var ethWeb3;
const web3Admin = require('web3admin');
var cors = require('cors');
//const InputDataDecoder = require('ethereum-input-data-decoder');
const abiDecoder = require('abi-decoder');
var log4js = require('log4js');
var logger = log4js.getLogger('app');
logger.level = 'debug';
const path = require('path');
var morganLogger = require('morgan');


var MongoClient = require('mongodb').MongoClient;

const express = require('express');
const app = express();

var pathval=__dirname + "";  // or directory name of ui folder
app.use(express.static(__dirname+"/UI/WebContent/"));
app.set('views',pathval);
app.use(morganLogger('dev'));

/**
 * 
 *Read app configuration from  config.json 
 */
let configRawData = fs.readFileSync('./appConfig.json');  
let configData = JSON.parse(configRawData);
logger.debug("initializing app : "+JSON.stringify(configData));
var mongoDBIp   = configData.mongoDBIp;
var mongodbPort = configData.mongoDBPort;
var appPort	=	configData.appPort;
var appAddress = configData.appAddress;
var web3Provider = configData.web3Provider;
var database_name = configData.database_name;
//mongodbURL to connect
var mongoDBURL = "mongodb://"+mongoDBIp+":"+mongodbPort+"/"+database_name;

//cors setting
app.use(cors());
app.options("*",cors());

//database object defined once
var db;

var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:22002"));
var ethWeb3 = new EthWeb3(new Web3.providers.HttpProvider(configData.web3Provider));

//logger.debug(ethWeb3);

// extend admin functionality of ethweb3
setTimeout(function(){
    web3Admin.extend(ethWeb3);
}, 2000)


/**
 * Get List Of Peers.
 * @function getPeers
 * 
 * @returns {JSONArray} peerList - returns list of peers in the blockchain.
 */
app.get('/getPeers',function(request, response){
	logger.info("getPeers");
	try{
		var peerList = ethWeb3.admin.peers;
		var empty = [];

		var jsonResponse = {
				"peerCount":peerList.length,
				"peerList":peerList
		}

		logger.debug(("printing peers"+JSON.stringify(jsonResponse)));
		return response.send(jsonResponse);
	}catch(e){
		logger.error("Error in getPeers");
	}
});

/**
 * Get Node Information.
 * @function getNodeInfo
 * 
 * @returns {JSONObject} peerNodeInfo - returns node information.
 */
app.get('/getNodeInfo', function(request, response){
	try{
		logger.info("getNodeInfo");
		var peerNodeInfo = ethWeb3.admin.nodeInfo;
		logger.debug(("printing nodeInfo"+JSON.stringify(peerNodeInfo)));
		return response.send(peerNodeInfo);
	}catch(e){
		logger.error("Error in getNodeInfo");
	}
});


/**
 * Get Transaction Data.
 * @function getTransaction
 * @param   {string}     txId            - transaction id
 * @returns {JSONObject} transactionData - returns transaction data.
 */
app.get('/getTransaction',function(request, response){
	logger.info("getTransaction");
	var txId    =   request.query.txId;
	logger.debug("txId : "+txId);

	try{
		var transactionData = ethWeb3.eth.getTransaction(txId);
		if(transactionData == null){
			console.log("transaction not found");
			transactionData = {
					error:"invalid transaction id or unable to find transaction"
			}
		}
		logger.debug(("printing transaction data "+JSON.stringify(transactionData)));
		return response.send(transactionData);
	}catch(e){
		logger.error("Error in getTransaction : "+e);
	}
});

/**
 * Get Transaction Receipt.
 * @function getTransactionReceipt
 * @param   {string}     txId            - transaction id
 * @returns {JSONObject} transactionReceipt - returns transaction receipt.
 */
app.get('/getTransactionReceipt',function(request, response){
	logger.info("getTransactionReceipt");
	var txId    =   request.query.txId;
	logger.debug("txId : "+txId);

	try{
		var transactionReceipt = ethWeb3.eth.getTransactionReceipt(txId);
		if(transactionReceipt == null){
			console.log("transaction receipt not found");
			transactionReceipt = {
					error:"invalid transaction id"
			}
		}
		logger.debug(("printing transaction receipt "+transactionReceipt));
		return response.send(transactionReceipt);
	}catch(e){
		logger.error("Error in getTransaction : "+e);
	}
});

/**
 * Fetch Block Data 
 * @function getBlock
 * @param {number}          blockNumber          - block number
 * @returns {JSONObject}    blockData            - return block data
 */
app.get('/getBlockData',function(request, response){
	logger.info("getBlockData");
	var blockNumber =   request.query.blockNumber;
	logger.debug("blockNumber : "+blockNumber);

	var blockData = ethWeb3.eth.getBlock(blockNumber);
	if(blockData == null){
		console.log("block not found");
		blockData={
				error:"block not found"
		}
	}

	logger.debug("printing block data "+blockData);
	return response.send(blockData);
});


/**
 * Fetch All Blocks From Blockchain
 * @function getAllBlocks
 * 
 * @returns {JSONArray}     blockDataList       -   returns list of block data
 */
app.get('/getAllBlocks', function(request, response){
	logger.info("getAllBlocks");
	db.collection("blocks").find({}).toArray(function(err, result) {
		if (err) throw err;
		if(result.length == 0){
			result={
					error:"blocks not found"
			}
		}
		return response.send(result.reverse());
	});
});



/**
 * Get Blocks By Range
 * @function getBlocksByRange
 * 
 * @param {number} start       - blocknumber
 * @param {number} end         - blocknumber
 * 
 * @returns {JSONArray} blockList
 */
app.get('/getBlocksByRange', function(request, response){
	logger.info("getBlocksByRange");
	var start   =   parseInt(request.query.start);
	var end     =   parseInt(request.query.end);

	logger.debug("start  block "+start);
	logger.debug("end    block "+end);

	logger.debug("fetching data from transactions collection ");

	var query = { "blockNumber" : { $gt: start, $lt: end } };
	db.collection("blocks").find(query).toArray(function(err, result) {
		if (err) throw err;
		console.log("fetched block data successfully");
		var blockList = result;

		if(blockList.length == 0){
			blockList={
					error:"invalid range or block not found"
			}
		}
		return response.send(blockList);
	});
});

/**
 * Get Live Blockchain Information
 * @function getBlockchainInfo
 * 
 * @returns {JSONObject} blockChainInfo     -   returns numberOfBlocks, number of peers, node status, pending txns, queued txns.
 */
app.get('/getBlockchainInfo',function(request, response){
	logger.info("getBlockchainInfo");
	db.collection("transactions").count(function(err, result){
		if (err) throw err;
		logger.debug("printing transactions count : "+result);
		var txStatus = ethWeb3.txpool.status;

		var txPoolStatus = {
				"pending":parseInt(txStatus.pending),
				"queued":parseInt(txStatus.queued)
		}


		var blockChainInfo = {
				"peerCount":ethWeb3.admin.peers.length,
				"blockHeight":ethWeb3.eth.blockNumber,
				"nodeStatus":ethWeb3.net.listening,
				"txPoolStatus":txPoolStatus,
				"accountsLength":ethWeb3.eth.accounts.length,
				"txCount":result
		}
		if(blockChainInfo == null){
			blockChainInfo = {
					error:"cannot fetch blockchain info"
			}
		}
		logger.debug(blockChainInfo);
		return response.send(blockChainInfo);
	});
});

/**
 * Get Current BlockHeight
 * 
 * @function getBlockHeight
 * 
 * @returns {JSONObject} blockHeight    -   returns blockHeight
 */

app.get('/getBlockHeight',function(request, response){
	logger.info("getBlockHeight");
	var blockHeight = {
        blockHeight:ethWeb3.eth.blockNumber
    }

    if(blockHeight == null){
        blockHeight = {
            error:"cannot fetch blockHeight"
        }

    }
    logger.debug(blockHeight);
    return response.send(blockHeight);
});

/**
 * Get transaction count
 * 
 * @function getTransactionCount
 * 
 * @returns     {JSONObject} txCount   - returns transaction count
 */
app.get('/getTxCount',function(request, response){
	logger.info("getTxCount");
	//connect to mongodb check ttransactions collection
	logger.debug("fetching data from transactions collection ");
	db.collection("transactions").count(function(err, result){
		if (err) throw err;
		console.log("printing transactions count : "+result);
		var txCount = {
				txCount : result
		}
		return response.send(txCount);
	});
});


 /**
  * API to get quorum node info
  * 
  * @function                    getQuorumNodeInfo
  * 
  * @returns     {JSONObject}    quorumNodeInfo
  */
 app.get('/getQuorumNodeInfo',function(request, response){

	 // API not in use anymore 
	 // Quorum chain consensus removed in quorum 2.0
	 //quorum options not available
	 /*
	 web3.quorum.getNodeInfo(function(error, result){
		 console.log(error, result);
		 return response.send(result);
	 });
	*/
	 response.send("API deprecated");
 });

 /**
  * 
  * API to get raft role
  * not ready
  */
 app.get('/getRaftRole',function(request, response){
	logger.info("getRaftRole");
	/*
	var role = ethWeb3;
	logger.debug("role : "+JSON.stringify(role));
	return response.send({
		role:role
	});
	*/
	
 });
 
 
 
 /**
  * API to decode transaction input
  * 
  * @function                        getDecodedInput
  * 
  * @param           {string}        hexString
  * 
  * @returns         {JSONObject}    decodedInput
  * 
  */
 /*
 app.get('/getDecodedInputByTxId', function(request, response){
	 logger.info("getDecodedInputByTxId");
	 var transactionHash     =   request.query.transactionHash;
	 logger.debug("transaction hash is : "+transactionHash);
	 //get transaction
	 var transactionData = ethWeb3.eth.getTransaction(transactionHash);
	 if(transactionData == null){
		 message = {
				 message:"invalid transaction"
		 }
		 response.send(message);
	 }
	 var toAddress = transactionData.to;
	 var inputData = transactionData.input;
	 logger.debug("to address is : "+toAddress);
	 logger.debug("input data is : "+inputData);
	 //check whether toAddress is contract address or not
	 logger.debug("searching abi for address : "+toAddress);
	 query = {contractAddress:toAddress};
	 db.collection("contracts").findOne(query,function(err, result){
		 if (err) throw err;
		 //if found then send decoded input otherwise send error message
		 console.log("printing result : "+result);

		 if(result == null){
			 var message = {
					 message : "Unable to decode input data"
			 }
			 response.send(message);
		 }else{
			 var abi = result.abi;
			 //decode input string
			 try{
				 abiDecoder.addABI(JSON.parse(abi));
			 }catch(Exception){
				 abiDecoder.addABI(abi);
			 }
			 const decodedInput = abiDecoder.decodeMethod(inputData);
			 logger.debug("printing decoded string : "+decodedInput);
			 response.send(decodedInput);
		 }
	 });
 });
*/
app.get('/getDecodedInputByTxId', function(request, response){
	logger.info("getDecodedInputByTxId");
	var transactionHash     =   request.query.transactionHash;
	logger.debug("transaction hash is : "+transactionHash);
	//get transaction
	var transactionData = ethWeb3.eth.getTransaction(transactionHash);
	if(transactionData == null){
		message = {
				message:"invalid transaction"
		}
		response.send(message);
	}
	var toAddress = transactionData.to;
	var inputData = transactionData.input;
	logger.debug("to address is : "+toAddress);
	logger.debug("input data is : "+inputData);
	//check whether toAddress is contract address or not
	logger.debug("searching abi for address : "+toAddress);
	query = {contractAddress:toAddress};
	var message = {
		message : "Unable to decode input data"
	}
	response.send(message);
	/*
	db.collection("contracts").findOne(query,function(err, result){
		if (err) throw err;
		//if found then send decoded input otherwise send error message
		console.log("printing result : "+result);

		if(result == null){
			var message = {
					message : "Unable to decode input data"
			}
			response.send(message);
		}else{
			var abi = result.abi;
			//decode input string
			try{
				abiDecoder.addABI(JSON.parse(abi));
			}catch(Exception){
				abiDecoder.addABI(abi);
			}
			const decodedInput = abiDecoder.decodeMethod(inputData);
			logger.debug("printing decoded string : "+decodedInput);
			response.send(decodedInput);
		}
	});
	*/
});


/**
 * API to get decoded logs from transaction receipt
 * @function                    getDecodedLogs
 * 
 * @param       {string}        transactionHash
 * 
 * @returns     {JSONObject}    decodedLogs
 */
/*
 app.get('/getDecodedLogs', function(request, response){
	 logger.info("getDecodedLogs");
	 var transactionHash = request.query.transactionHash;
    logger.debug("transaction hash is : "+transactionHash);
    //get transaction
    var transactionData = ethWeb3.eth.getTransactionReceipt(transactionHash);
    var txTest = ethWeb3.eth.getTransaction(transactionHash);
    var inputMethod = txTest.input;

    if(transactionData == null){
        message = {
            message:"invalid transaction"
        }
        response.send(message);
    }
    var toAddress = transactionData.to;
    var inputData = transactionData.logs;
    logger.debug("to address is : "+toAddress);
    logger.debug("input data is : "+inputData);
    //check whether toAddress is contract address or not
        logger.debug("searching abi for address : "+toAddress);
        query = {contractAddress:toAddress};
        db.collection("contracts").findOne(query,function(err, result){
            if (err) throw err;
            //if found then send decoded input otherwise send error message
            logger.debug("printing result : "+result);

            if(result == null){
                var message = {
                    message : "Unable to decode input data"
                }
                response.send(message);
            }else{
                var abi = result.abi;
                abiDecoder.addABI(JSON.parse(abi));
                var decodedLogs = abiDecoder.decodeLogs(inputData);
               // console.log("printing test decoding "+JSON.stringify(abiDecoder.decodeMethod(inputMethod)));
                logger.debug("printing decoded logs : "+decodedLogs);
                response.send(decodedLogs);
            }
        });
 });
*/

app.get('/getDecodedLogs', function (request, response) {
	logger.info("getDecodedLogs");
	var transactionHash = request.query.transactionHash;
	logger.debug("transaction hash is : " + transactionHash);
	//get transaction
	var transactionData = ethWeb3.eth.getTransactionReceipt(transactionHash);
	var txTest = ethWeb3.eth.getTransaction(transactionHash);
	var inputMethod = txTest.input;

	if (transactionData == null) {
		message = {
			message: "invalid transaction"
		}
		response.send(message);
	}
	var toAddress = transactionData.to;
	var inputData = transactionData.logs;
	logger.debug("to address is : " + toAddress);
	logger.debug("input data is : " + inputData);
	//check whether toAddress is contract address or not
	logger.debug("searching abi for address : " + toAddress);
	query = { contractAddress: toAddress };
	var message = {
		message: "Unable to decode input data"
	}
	response.send(message);
	/*
   db.collection("contracts").findOne(query,function(err, result){
	   if (err) throw err;
	   //if found then send decoded input otherwise send error message
	   logger.debug("printing result : "+result);

	   if(result == null){
		   var message = {
			   message : "Unable to decode input data"
		   }
		   response.send(message);
	   }else{
		   var abi = result.abi;
		   abiDecoder.addABI(JSON.parse(abi));
		   var decodedLogs = abiDecoder.decodeLogs(inputData);
		  // console.log("printing test decoding "+JSON.stringify(abiDecoder.decodeMethod(inputMethod)));
		   logger.debug("printing decoded logs : "+decodedLogs);
		   response.send(decodedLogs);
	   }
   });
   */
});

// ************************************************ API's for analytics **********************************************


/**
 * API to get transactions by contract address
 * 
 * @function                    getTransactionsByContractAddress
 * 
 * @param       {string}        contractAddress
 * @returns     {JSONArray}     transactionList
 */
app.get('/getTransactionsByContractAddress',function(request, response){
	logger.info("getTransactionsByContractAddress");
    var contractAddress = request.query.contractAddress;
    logger.debug("contractAddress : "+contractAddress);
        let query = {contractAddress:contractAddress};
        db.collection("contract_txns").find(query).toArray(function(err, transactionList){
            if (err) throw err;
            //if found then send decoded input otherwise send error message
            console.log("printing result : "+JSON.stringify(transactionList));
            if(transactionList == null){
                var message = {
                    message : "Unable to decode input data"
                }
                response.send(message);
            }else{
                response.send(transactionList);
            }
        });
});


/**
 * 
 * API to get transaction count by contract address
 * 
 * @function                    getTransactionCountByContractAddress
 * 
 * @returns     {JSONArray}     transactionCountList
 * 
 */
app.get('/getTransactionCountByContractAddress',function(request, response){
	logger.info("getTransactionCountByContractAddress");
	var transactionCountList=[];
        db.collection("contract_txns").find({}).toArray(function(err, contractData){
            if (err) throw err;
            //if found then send decoded input otherwise send error message
            console.log("printing result : "+JSON.stringify(contractData));
            if(contractData == null){
                var message = {
                    message : "Error. Unable to fetch transactions"
                }
                response.send(message);
            }else{
                    db.collection("contracts").find({}).toArray(function(err, contractList){
                        logger.debug("printing contract list : "+JSON.stringify(contractList));
                        for(let index = 0 ; index < contractList.length; index++){
                            var contractObject = contractList[index];
                            var count = 0;
                            var txList = [];
                            for(var i = 0 ; i < contractData.length; i++){
                                if(contractObject.contractAddress == contractData[i].contractAddress){
                                    count = count + 1;
                                    txList.push(contractData[i].tx_id);
                                }
                            }

                            var transactionCountObject = {
                                contractAddress:contractObject.contractAddress,
                                contractName:contractObject.contractName,
                                txCount:count,
                                txList:txList
                            }

                            transactionCountList.push(transactionCountObject);
                        }

                        return response.send(transactionCountList);
                    });
            }
        });
});



/**
 * API to get number of transactions by block
 * 
 * @function                    getTransactionsCountByBlock
 * 
 * @returns     {JSONObject}    transactionsPerBlock
 * @summary     returns count of tx by latest block
 */

 app.get('/getTransactionsCountByBlock',function(request, response){
	logger.info("getTransactionsCountByBlock");
	var blockNumber = ethWeb3.eth.blockNumber;
	var block = ethWeb3.eth.getBlock(blockNumber);
    	var txCount = block.transactions.length;
    	logger.debug("blockNumber : "+blockNumber);
    	logger.debug("block : "+JSON.stringify(block));
    	logger.debug("txCount : "+JSON.stringify(txCount));
    	var transactionsPerBlock = {
        	blockNumber:blockNumber,
        	txCount:txCount
    	}
    	response.send(transactionsPerBlock);
});

/**
 * 
 * API to get number of transactions by blockTimestamp
 * 
 * @function                    getTransactionCountByTimestamp
 * 
 * @returns     {JSONOject}     transactionCountByTimestamp
 */

app.get('/getTransactionCountByTimestamp',function(request, response){
	logger.info("getTransactionCountByTimestamp");
	var blockNumber = ethWeb3.eth.blockNumber;
    	var block = ethWeb3.eth.getBlock(blockNumber);
    	var timeStamp = block.timestamp;
    	var txCount = block.transactions.length;

    	var transactionCountByTimestamp = {
        	txCount:txCount,
        	timestamp:timeStamp
    	}
    response.send(transactionCountByTimestamp);
});

/**
 * API to get gas used by blockNumber
 * 
 * @function                    getGasUsedBYBlock
 * @returns     {JSONObject}    gasUsedByBlock
 */

 app.get('/getGasUsedByBlock',function(request, response){

	logger.info("getGasUsedByBlock");
    var blockNumber = ethWeb3.eth.blockNumber;
    var block       = ethWeb3.eth.getBlock(blockNumber);
    var gasUsed = block.gasUsed;
    var gasUsedByBlock = {
        blockNumber:blockNumber,
        gasUsed:gasUsed
    }
    response.send(gasUsedByBlock);
 });


/**
 * API to get difficulty rate by blockTimestamp
 * 
 * @function                    getDifficultyRateByTimestamp
 * 
 * @returns     {JSONObject}    difficultyRate
 * 
 */


app.get('/getDifficultyRateByTimestamp',function(request, response){
    var blockNumber       = ethWeb3.eth.blockNumber;
    var block       = ethWeb3.eth.getBlock(blockNumber);
    var difficulty  = block.difficulty;
    var timeStamp   = block.timestamp; 
    
    console.log("printing difficulty rate : "+difficulty);
    console.log("printing timestamp "+timeStamp);

    var difficultyRate = {
        difficulty:difficulty,
        timestamp:timeStamp
    }

    response.send(difficultyRate);
});


/**
 * API to get ether distribution by accounts
 * 
 * @function                    getEtherDistribution
 * 
 * @returns     {JSONObject}    
 */
app.get('/getEtherDistribution',function(request,  response){
    var   accountsLength  = ethWeb3.eth.accounts.length;
    var etherDistributionList=[];
    console.log("******** get Ether Distribution ********");
    for(var index = 0; index < accountsLength; index++){
        var account = ethWeb3.eth.accounts[index];

        var etherBalance = ethWeb3.eth.getBalance(account);

        var etherDistribution = {
            account:account,
            ether:etherBalance
        }

        etherDistributionList.push(etherDistribution);
    }
    response.send(etherDistributionList);
});

app.get('/getNodeName', function(request, response){
	
	var appConfigRaw = fs.readFileSync('./appConfig.json');
	var appConfigJson = JSON.parse(appConfigRaw);
	console.log("appConfigJson: ", appConfigJson);
	var nodeName = appConfigJson.nodeName;

	response.send({
		"nodeName":nodeName
	});
});

//assuming app is express Object.
app.get('/index',function(req,res){
	res.sendFile(path.join(__dirname+'/UI/WebContent/index.html'));
});


app.use('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    var jsonResponse = {
        message:"Generic DashBoard API V0.1"
    }
    res.send(jsonResponse);
})

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * Connect to mongodb first and then start the server.
 */
MongoClient.connect(mongoDBURL, function(err, database) {
  if(err) throw err;
    db = database;
    setTimeout(function(){
	app.listen(appPort, appAddress,function () {
        	logger.info("Application  listening on port  "+appPort);
    	});
	},3000);
});  
