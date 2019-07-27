
var fs = require("fs");

function printUsage(){
    console.log("printing printUsage: ");
    console.log("updateConfig.js");
    console.log("ARGS[1]: rpcAddress");
    console.log("ARGS[2]: rpcPort");
    console.log("ARGS[3]: mongodbIP");
    console.log("ARGS[4]: mongodbPort");
    console.log("ARGS[5]: nodeName");
}

function updateConfig(rpcAddress, rpcPort, mongodbIP, mongodbPort, nodeName, appPort, database_name){
   
   //create app config json object
    var appConfigJson =  {
        "appAddress":"0.0.0.0",
        "appPort":appPort,
        "mongoDBIp":mongodbIP,
        "mongoDBPort":mongodbPort,
        "web3Provider":"http://"+rpcAddress+":"+rpcPort,
        "nodeName":nodeName,
        "database_name":database_name
    }

    //create sync api config object
    var syncConfigJson = 
        {
            "web3Provider":"http://"+rpcAddress+":"+rpcPort
        }
    
    console.log("saving appConfig.json: ", appConfigJson);

    fs.writeFileSync("./appConfig.json", JSON.stringify(appConfigJson));

    console.log("saving syncAPIConfig.json: ",syncConfigJson);
    
    fs.writeFileSync("./syncConfig.json", JSON.stringify(syncConfigJson));

}


var cmdArgs = process.argv.slice(2);

console.log("cmdArgs: ", cmdArgs);


if(cmdArgs.length == 7){
updateConfig(cmdArgs[0], cmdArgs[1], cmdArgs[2], cmdArgs[3], cmdArgs[4], cmdArgs[5], cmdArgs[6]);
}else{
    console.log(new Error("Invalid Params"));
    printUsage();
}