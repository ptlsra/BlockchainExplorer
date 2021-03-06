$(document).ready(function(){
        // fetch ip address and port number
    /*
    var ipAddress   =   localStorage.getItem("ipAddress");
    var portNo      =   localStorage.getItem("portNo");
    */
    var tempLists=[];
    var dataSets=[];

    /*
    var nodeName=localStorage.getItem("nodeName");
	document.getElementById("nodeName").innerHTML=nodeName;
    */
    		//get node name
		$.getJSON("/getNodeName",  (result) => {
			var nodeName = result.nodeName;
			document.getElementById("nodeName").innerHTML=nodeName;
		});




    /**
     * 
     *
     *  function to init data table with first 1000 blocks
     *  @function   initDataTable
     * 
     */

    function initDataTable(from, to){
        $.ajax({
            dataType: "json",
            url: "/getBlocksByRange?start="+from+"&end="+to,
            global: false,
            type: 'GET',
            async: false, 
            success: function(response) {
               
                    for(var index=0;index < response.length; index++){
                        var item = response[index];

                            var unixtimestamp = item.timeStamp.toString().slice(0,-9);
                            //var unixtimestamp = item.timeStamp.toString();
                            var txCount = item.txCount;
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


                        tempLists.push(index+1,'<a title="'+ item.blockHash+'"href=blockData.html?blockNo='+item.blockHash+ '>'+item.blockHash,item.blockNumber, txCount, convdataTime);
                        dataSets.push(tempLists);
                        tempLists=[];
                    }

                    $('#allBlocks').DataTable( {
                        data: dataSets,
                        destroy: true,
                        searching: true,
                        "order": [[ 2, "desc" ]],
                        columns: [
                            {title: "SNo" },
                            {title: "Block Hash" },
                            {title: "Block No"},
                            {title: "Transactions"},
                            {title: "TimeStamp"}
                        ]
                    });
            }
        });
        //stop loading once table is initialized
        $(".se-pre-con").fadeOut("slow");
    }


    function searchBlockData(blockNumber){
    	
        $.ajax({
            dataType: "json",
            url: "/getBlockData?blockNumber="+blockNumber,
            global: false,
            type: 'GET',
            async: false, 
            success: function(response) {

                        var item = response;

                            var unixtimestamp = item.timestamp.toString();
                            if(unixtimestamp != 0){
                            	unixtimestamp = unixtimestamp.slice(0,-9);
                            }
                            var txCount = item.transactions.length;
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

                        tempLists.push(1,'<a title="'+ item.hash+'"href=blockData.html?blockNo='+item.hash+ '>'+item.hash+'....',blockNumber,txCount, convdataTime);
                        dataSets.push(tempLists);
                        tempLists=[];

                    $('#allBlocks').DataTable( {
                        data: dataSets,
                        destroy: true,
                        searching: true,
                        "order": [[ 2, "desc" ]],
                        columns: [
                            {title: "SNo" },
                            {title: "Block Hash" },
                            {title: "Block No"},
                            {title: "Transactions"},
                            {title: "TimeStamp"}
                        ]
                    });
                
            }
        });
        $(".se-pre-con").fadeOut("slow");
    }

    initDataTable(0,1001);
    $(".se-pre-con").fadeOut("slow");
    
    $("#block-search-button").click(function(){
        //alert("The paragraph was clicked.");
    	$(".se-pre-con").fadeIn("slow");
    	
        var from = document.getElementById("from-field").value;
        var to = document.getElementById("to-field").value;
        from  = from - 1;
        to++;
        console.log(from);
        console.log(to);
        setTimeout(function(){
        	//destroy the data table and reinit 
            //datatable older version does not support destruction of table
            $('#allBlocks').DataTable().destroy();
            dataSets = [];
            tempLists = [];
            initDataTable(from, to);
        },1000);
        
    });



    $("#single-block-search-button").click(function(){
        //alert("The paragraph was clicked.");
    	$(".se-pre-con").fadeIn("slow");
        var blockNumber = document.getElementById("block-number-field").value;
        
        setTimeout(function(){
	        //destroy the data table and reinit 
	        //datatable older version does not support destruction of table
	        $('#allBlocks').DataTable().destroy();
	        dataSets = [];
	        tempLists = [];
	        //initDataTable(from, to);
	        searchBlockData(blockNumber);
        },1000);

    });

});