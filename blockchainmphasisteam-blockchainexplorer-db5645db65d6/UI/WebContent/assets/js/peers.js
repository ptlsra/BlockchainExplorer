//fetch ipaddress and port number
/*
var ipAddress       =   localStorage.getItem("ipAddress");
var portNumber      =   localStorage.getItem("portNo");
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

var tempList=[];
var dataSets=[];
//function to get peers info from api

function getPeerInfo(){
	$.getJSON("/getPeers", function(result){
		//document.getElementById("peers-data").innerHTML = JSON.stringify(result, undefined, 2);
		//fetch the peer details and put it into jquery table

		for(let index=0;index<result.peerList.length;index++){
			let peer = result.peerList[index];
			tempList.push(index+1,  (result.peerList[index].id).substr(0,20)+".....", result.peerList[index].network.remoteAddress, result.peerList[index].name);
			dataSets.push(tempList);
			tempList=[];
		}

		$('#peers-table').DataTable( {
			data: dataSets,
			destroy: true,
			searching: true,
			columns: [
				{title: "SNo" },
				{title: "Peer Id" },
				{title: "Remote Address"},
				{title: "Name"}
				]
		});
		$(".se-pre-con").fadeOut("slow");
	});
	
}

//call the function
getPeerInfo();