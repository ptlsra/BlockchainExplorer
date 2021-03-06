
$(document).ready(function(){
	$("#TxDetails").hide();

	$("#transactions").click(function(){
		$("#TxDetails").show();
	});


	var tempLists=[];
	var dataSets=[];
	/*
	var ipAddress=localStorage.getItem("ipAddress");
	var portNo=localStorage.getItem("portNo");
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


//	function to get request params
	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};



//	main logic to display transaction details on to the page
	var txid = getUrlParameter('txid');
	document.getElementById("dashboard-heading-block").innerHTML = "Transaction Id : "+txid; 


//	first get decoded input

	
	$.ajax({

		dataType: "json",
		url: "/getTransaction?txId=" + txid,
		global: false,
		type: 'GET',
		async: false, //blocks window close
		success: function (response) {
			document.getElementById("blockNumber").innerHTML = response.blockNumber;
			document.getElementById("blockHash").innerHTML = '<a href=#data-toggle="tooltip" title=' + response.blockHash + '>' + response.blockHash.substring(0, 40) + '... </a>';
			document.getElementById("from").innerHTML = response.from;
			document.getElementById("gas").innerHTML = response.gas;
			document.getElementById("gasPrice").innerHTML = response.gasPrice;
			document.getElementById("hash").innerHTML = '<a href=#data-toggle="tooltip" title=' + response.hash + '>' + response.hash.substring(0, 40) + '... </a>';
			document.getElementById("input").innerHTML = response.input.substring(0, 20);
			//document.getElementById("input").innerHTML = "<a href=decodedinput.html?transactionHash="+response.hash+">"+response.input+"</a>";
			document.getElementById("nonce").innerHTML = response.nonce;
			document.getElementById("to").innerHTML = response.to;
			document.getElementById("transactionIndex").innerHTML = response.transactionIndex;
			document.getElementById("value").innerHTML = response.value+" ETH";
			document.getElementById("v").innerHTML = response.v;
			document.getElementById("r").innerHTML = '<a href=#data-toggle="tooltip" title=' + response.r + '>' + response.r.substring(0, 40) + '... </a>';
			document.getElementById("s").innerHTML = '<a href=#data-toggle="tooltip" title=' + response.s + '>' + response.s.substring(0, 40) + '... </a>';

			$.getJSON("/getDecodedInputByTxId?transactionHash=" + response.hash, function (result) {
				document.getElementById("decodedinput-data").innerHTML = JSON.stringify(result, undefined, 4);
			});
		}
	});
	$(".se-pre-con").fadeOut("slow");
});
	
