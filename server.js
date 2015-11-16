var http = require('http');
var url = require('url');
var express = require('express');
var app = express(); 

//base URL fetcher
app.get('/',function(req,res){
	res.send("Invalid URL");

});

//listens for the age request
app.get('/users/age',function(req,res){

	//local variables
	var min = req.query.min_age;
	var max = req.query.max_age;
	//converter mechanism
	var Converter = require("csvtojson").Converter;
	var converter = new Converter({});
	require("fs").createReadStream("./user.csv").pipe(converter);

	//end_parsed will be emitted once parsing finished
	converter.on("end_parsed", function (jsonArray) {
		
	//search the array for an instance of a variable with the searched name/id
	var result = [];
	var index = 0;
	var entry;

	var counter = 0;

	for (index = 0; index < jsonArray.length; ++index) {
		entry = jsonArray[index];
		if (entry.age >= min && entry.age<=max) {
			//every hit gets added to the JSONArray 
			result[counter] = entry;
			counter++;
			//console.log(entry.age); //just printing what it added
		}
	}

	//returning the result
	res.send(result);

	});
});

//this is the location search function
app.get('/users/loc',function(req,res){

	//variables
	var lat = req.query.lat;
	var lon = req.query.long;
	var dist = 8.04672;//5 miles in kilometers

	//converter mechanism
	var Converter = require("csvtojson").Converter;
	var converter = new Converter({});
	require("fs").createReadStream("./user.csv").pipe(converter);

	//end_parsed will be emitted once parsing finished
	converter.on("end_parsed", function (jsonArray) {

	//search the array for  an instance of a variable with the name needed
	var result = [];
	var index = 0;
	var entry;

	var counter = 0;

	for (index = 0; index < jsonArray.length; ++index) {
		entry = jsonArray[index];
		var t = distance(lat,lon,entry.lat,entry.long);

		if (dist>= t) {
			//add the results matching the requirements to the JSONArray
			result[counter] = entry;
			counter++;
			//console.log(t); //prints the distance
		}
	}
	//return result to client
	res.send(result);
	});
});


//simple function that calculates the distance. 
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

//this is the userID lookup function.
app.get('/users/:param1',function(req,res){

	//check if the param is actually present
	if(req.params.param1>=0){
		//converter mechanism
		var Converter = require("csvtojson").Converter;
		var converter = new Converter({});
		require("fs").createReadStream("./user.csv").pipe(converter);

		//end_parsed will be emitted once parsing finished
		converter.on("end_parsed", function (jsonArray) {

		//search the array for  an instance of a variable with the name needed
		var index = 0;
		var found;
		var entry;
		for (index = 0; index < jsonArray.length; ++index) {
			entry = jsonArray[index];
			if (entry.id == req.params.param1) {
				//mark the found item and break out of the loop.
				found = entry;
				break;
			}
		}
		//return result to client. Null if not found, as should be expected.
		res.send(found);

		});
	}
});


//setup of the actual server. listens to port 8080 at penguinologist.io
var server = app.listen(8080,function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('listening at http://%s:%s',host,port);
});
