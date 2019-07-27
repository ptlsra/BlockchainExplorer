from web3 import Web3, HTTPProvider, IPCProvider
from pymongo import MongoClient
from apscheduler.schedulers.blocking import BlockingScheduler
from web3.middleware import geth_poa_middleware
#w3.middleware_stack.inject(geth_poa_middleware, layer=0)
# create a mongo client
mongoClient = MongoClient();
client = MongoClient('localhost', 27017);

#connect to web3 provider at localhost 8102
web3 = Web3(HTTPProvider('http://localhost:22001'));
web3.middleware_stack.inject(geth_poa_middleware, layer=0);
print("connected to web3");

print("printing current block");
print(web3.eth.blockNumber);

def syncBlocks():
    print("######################### syncing with blockchain ###################");
    #using blockchaindb database
    blockchaindb = client.blockchaindb;

    #get latest blockHeight
    latestBlockHeight = web3.eth.blockNumber;
    print("latest block height is : "+str(latestBlockHeight));

    #check previous blockHeight
    chain_info = blockchaindb.chain_info;
    transactions = blockchaindb.transactions;
    blocks = blockchaindb.blocks;
    contracts = blockchaindb.contracts;
    contract_txns = blockchaindb.contract_txns;

    chainInfoRecord = chain_info.find_one();
    print("previous block height ");

    previousBlockHeight = 0;

    if chainInfoRecord == None:
        previousBlockHeight = 0;
        chainInfoObject={
            "id":"chaininfo",
            "blockHeight":previousBlockHeight
        }
        chain_info.insert_one(chainInfoObject);
    else:
        previousBlockHeight = chainInfoRecord['blockHeight'];
    print(previousBlockHeight);

    #Download blocks from blockchain

    l = [];

    for index in range(previousBlockHeight,latestBlockHeight):
        block       = web3.eth.getBlock(index);
        blockNumber = block['number'];
        blockHash   = block['hash'];
        timestamp   = block['timestamp'];
        txList      = block['transactions'];
        txLength    = len(txList);

        for tx_index in range(txLength):
            txData = web3.eth.getTransaction(txList[tx_index]);
            #print(txData);
            address = txData['to'];
            toAddress="";
            if address == None:
                toAddress = address;
            else:
                toAddress = address.lower();
            #toAddress = toAddress.lower();
            print("##### searching contract transactions #####");
            cursor = contracts.find({});
            for contractData in cursor:
                if toAddress == contractData['contractAddress']:
                    contractObject = {
                        "tx_id":web3.toHex(txList[tx_index]),
                        "contractAddress":toAddress,
                        "timestamp":timestamp,
                        "blockNumber":blockNumber
                    }
                    contract_txns.insert_one(contractObject);
            txObject = {
                "tx_id":web3.toHex(txList[tx_index]),
                "blockNumber":blockNumber,
                "timeStamp":timestamp
            }
            transactions.insert_one(txObject);
        print("downloading blocks ... "+str(index)+"/"+str(latestBlockHeight)+"done."+" Please wait ...");
#        print(str(blockHash));
        blockObject={
            "blockNumber":blockNumber,
            "blockHash":web3.toHex(blockHash),
            "timeStamp":timestamp,
            "txCount":txLength
        }
#        print(blockObject);
#        print("############ inserting block into db ############");
        blocks.insert_one(blockObject);
#        print("############### block inserted ##############");

    print("###################### updating chainInfo ########################");
    chain_info.update_one(
            {"id": "chaininfo"},
            {
            "$set": {
                "blockHeight":latestBlockHeight
            }
            }
        );

# Schedule the task so that it will run at certain intervals and keep database uptodate
scheduler = BlockingScheduler();
scheduler.add_job(syncBlocks, 'interval', seconds=9);
scheduler.start();

