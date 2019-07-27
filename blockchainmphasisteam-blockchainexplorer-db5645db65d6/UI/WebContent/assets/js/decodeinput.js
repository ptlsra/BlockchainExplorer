$(document).ready(function(){
	// fetch ipaddress and port number
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

	// function to get decoded input
	function getDecodedInput(){
		// get input value from the html
		var transactionHash = getUrlParameter("transactionHash");
		//decode the input
		$.getJSON("/getDecodedInputByTxId?transactionHash="+transactionHash, function(result){
			document.getElementById("decodedinput-data").innerHTML = JSON.stringify(result, undefined, 4);
			$(".se-pre-con").fadeOut("slow");
		});
		
	}
	//call the function

	getDecodedInput();
});