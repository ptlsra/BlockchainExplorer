/**
 * http://usejsdoc.org/
 */
/*
$(window).load(function() {
	// Animate loader off screen
	
});
*/

$(document).ready(function(){
    /**
    * get blockchain info on startup & check every 5 seconds
    */

	function initDashBoard() {
		/*
		var ipAddress = "172.21.80.81";
		var portNo = "5600";
		var nodeManagerPort = "22005";
		localStorage.setItem("ipAddress", ipAddress);
		localStorage.setItem("portNo", portNo);
		*/

		/*
		var nodeName = "Mbroker";
		localStorage.setItem("nodeName", nodeName);
		*/

		//get node name
		$.getJSON("/getNodeName",  (result) => {
			var nodeName = result.nodeName;
			document.getElementById("nodeName").innerHTML=nodeName;
		});

		//document.getElementById("nodeName").innerHTML=nodeName;
		//$.getJSON("http://" + ipAddress + ":" + portNo + "/getBlockChainInfo", function (result) {
		$.getJSON("/getBlockChainInfo", function (result) {
			// fetch json data
			var blockHeight = result.blockHeight;
			var nodeStatus = result.nodeStatus;
			var accounts = result.accountsLength;

			if (nodeStatus == true) {
				nodeStatus = "Running";
			} else {
				nodeStatus = "Stopped";
			}

			var peerCount = result.peerCount;
			var pendingTxn = result.txPoolStatus.pending;
			var txCount = result.txCount;

			//Show values to the browser
			$("#dashboard-blocks-span").text(blockHeight);
			$("#dashboard-peers-span").text(peerCount);
			$("#dashboard-nodestatus-span").text(nodeStatus);
			$("#dashboard-pending-txn-span").text(pendingTxn);
			$("#dashboard-txns-span").text(txCount);
			$("#dashboard-accounts-span").text(accounts);
			$(".se-pre-con").fadeOut("slow");
		});
	}
	initDashBoard();
	//call in intervals
    setInterval(initDashBoard, 10000);
});
