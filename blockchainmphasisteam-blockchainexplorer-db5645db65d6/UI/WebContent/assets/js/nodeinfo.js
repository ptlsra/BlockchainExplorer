$(document).ready(function(){
//	fetch ipaddress and port number
	/*
	var ipAddress   =   localStorage.getItem("ipAddress");
	var portNumber  =   localStorage.getItem("portNo");
	*/
	/*
	var nodeName=localStorage.getItem("nodeName");
	document.getElementById("nodeName").innerHTML=nodeName;
	*/

	//get node name
	$.getJSON("/getNodeName",  (result) => {
		var nodeName = result.nodeName;
		document.getElementById("nodeName").innerHTML=nodeName;
	});
	

//	function to get peers info from api
	function getNodeInfo(){
		//var interval = setInterval(function() {
		$.getJSON("/getNodeInfo", function(result1){
			var nodeInfo = result1;
				//document.getElementById("node-info").innerHTML = JSON.stringify(response, undefined, 4);
				document.getElementById("node-id").innerHTML = '<a href=#data-toggle="tooltip" title='+nodeInfo.id+'>'+nodeInfo.id.substring(0,40)+'... </a>';
				document.getElementById("node-name").innerHTML = nodeInfo.name;
				document.getElementById("enode").innerHTML = '<a href=#data-toggle="tooltip" title='+nodeInfo.enode+'>'+nodeInfo.enode.substring(0,40)+'... </a>';
				document.getElementById("ip").innerHTML = nodeInfo.ip;
				document.getElementById("listen-address").innerHTML = nodeInfo.listenAddr;
				document.getElementById("genesis").innerHTML = '<a href=#data-toggle="tooltip" title='+nodeInfo.protocols.eth.genesis+'>'+nodeInfo.protocols.eth.genesis.substring(0,40)+'... </a>';
				$(".se-pre-con").fadeOut("slow");
		});
	}
//	call the function
	getNodeInfo();
});
