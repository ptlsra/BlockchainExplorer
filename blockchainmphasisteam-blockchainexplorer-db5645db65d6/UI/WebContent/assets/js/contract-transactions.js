
$(document).ready(function(){
	// fetch ip address and port number
	/*
	var ipAddress   =   localStorage.getItem("ipAddress");
	var portNo      =   localStorage.getItem("portNo");
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
	
	var tempLists=[];
	var dataSets=[];

	//function to get parameter value
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

	/**
	 * @function            getContractTransactions
	 * @param {string}      contractAddress
	 * 
	 */
	function getContractTransactions(contractAddress,contractName){
		document.getElementById("peers-first-row-heading").innerHTML="Contract Txn for "+contractName+" with address: "+contractAddress;
		$.ajax({
			dataType: "json",
			url: "/getTransactionsByContractAddress?contractAddress="+contractAddress,
			global: false,
			type: 'GET',
			async: false, 
			success: function(response) {

				for(var index=0;index < response.length; index++){
					var item = response[index];
					//var unixtimestamp = item.timestamp.slice(0,-9);
					var unixtimestamp = item.timestamp.toString().slice(0,-9);
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

					tempLists.push(index+1,'<a title="'+ item.tx_id+'"href=singleTx.html?txid='+item.tx_id+ '>'+item.tx_id.substr(0, 20)+'....',item.blockNumber,convdataTime);
					dataSets.push(tempLists);
					tempLists=[];
				}

				$('#contract-transactions').DataTable( {
					data: dataSets,
					destroy: true,
					searching: true,
					"order": [[ 2, "desc" ]],
					columns: [
						{title: "SNo" },
						{title: "Transaction Id" },
						{title: "Block Number"},
						{title: "Timestamp"}
						]
				});

			}
		});
		$(".se-pre-con").fadeOut("slow");
	}
	var contractAddress = getUrlParameter('contractAddress');
	var contractName = getUrlParameter('contractName');
	getContractTransactions(contractAddress,contractName);

});