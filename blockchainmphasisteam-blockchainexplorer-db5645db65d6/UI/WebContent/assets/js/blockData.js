$(document).ready(function(){
	$("#TxDetails").hide();

	$("#transactions").click(function(){
		$("#TxDetails").show();
	});


	var tempLists=[];

	var dataSets=[];
	/*
	var ipAddress=localStorage.getItem("ipAddress");
//	alert(ipAddress);
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

	var blockNo = getUrlParameter('blockNo');
	document.getElementById("dashboard-heading-block").innerHTML = "Block Hash : "+blockNo; 


	$.ajax({

		dataType: "json",
		url: "/getBlockData?blockNumber="+blockNo,
		global: false,
		type: 'GET',
		async: false, //blocks window close
		success: function(response) {

			document.getElementById("blockNumber").innerHTML = response.number;
			document.getElementById("receiptsRoot").innerHTML = response.receiptsRoot;
			document.getElementById("parentHash").innerHTML = response.parentHash;
			document.getElementById("difficulty").innerHTML = response.difficulty;
			document.getElementById("extraData").innerHTML = response.extraData;
			document.getElementById("gasLimit").innerHTML = response.gasLimit;
			document.getElementById("gasUsed").innerHTML = response.gasUsed;
			document.getElementById("hash").innerHTML = response.hash;
			document.getElementById("miner").innerHTML = response.miner;
			document.getElementById("mixHash").innerHTML = response.mixHash;
			document.getElementById("nonce").innerHTML = response.nonce;
			document.getElementById("sha3Uncles").innerHTML = response.sha3Uncles;
			document.getElementById("size").innerHTML = response.size;
			document.getElementById("stateRoot").innerHTML = response.stateRoot;

			var unixtimestamp = response.timestamp.toString();
			unixtimestamp = unixtimestamp.slice(0,-9)
			// Months array
			var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

			// Convert timestamp to milliseconds
			var date = new Date(unixtimestamp*1000);

			// Year
			var year = date.getFullYear();

			// Month
			var month = months_arr[date.getMonth()];

			// Day
			var day = date.getDate();

			// Hours
			var hours = date.getHours();

			// Minutes
			var minutes = "0" + date.getMinutes();

			// Seconds
			var seconds = "0" + date.getSeconds();

			// Display date time in MM-dd-yyyy h:m:s format
			var convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

			document.getElementById("timeStamp").innerHTML = convdataTime;
			document.getElementById("totalDifficulty").innerHTML = response.totalDifficulty;
			document.getElementById("transactionsRoot").innerHTML = response.transactionsRoot;

			document.getElementById("transactions").innerHTML = "<a href=#> Count -"+response.transactions.length+"</a>";
			var table = document.getElementById("TxDetails");
			var row = table.insertRow(0);
			var cell = row.insertCell(0);
			var cells = row.insertCell(1);
			cell.innerHTML = "Count";
			cells.innerHTML="Txid";
			$.each(response.transactions, function(i, item) {
				var row = table.insertRow(i+1);
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				cell1.innerHTML = i+1;
				cell2.innerHTML = "<a href=singleTx.html?txid="+response.transactions[i]+">"+response.transactions[i]+"</a>";

			});
		}
	});
    $(".se-pre-con").fadeOut("slow");
});