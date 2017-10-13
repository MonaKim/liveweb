// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8081);

function requestHandler(req, res) {

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);
		
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);	
}

var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('chatmessage', function(data) {
			// // Data comes in as whatever was sent, including objects
			console.log("Received bla: 'chatmessage' " + data);
			
			sendGIF(data);
			// // Send it to all of the clients
			// socket.broadcast.emit('chatmessage', data);
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);

var accountSid = 'AC64dbef4652a8df236a618bd7c4febfea'; //
var authToken = '1cdb01d17601b41a2249373e261f4c98';   // Your Auth Token from www.twilio.com/console


function sendGIF(word){
	const RapidAPI = new require('rapidapi-connect');
	const rapid = new RapidAPI('default-application_59c07e80e4b04627fc653566', '82178cda-d83b-4172-a493-e75a508b0ef6');

	rapid.call('Giphy', 'translateTextToGif', { 
	    'rating': 'pg',
	    'apiKey': 'F6nXw3LJLn9Lv9W5JqTeqxmYJijQBf0j', //This is GIPHY's public beta key
	    'text': word, //This value needs to be input by user
	    'lang': 'en'
	}).on('success', (payload)=>{
	    var gif = payload.data.images.fixed_height.url;
	    rapid.call('Twilio', 'sendMms', { 
	        'from': '+12018175330', //This is the phone number you register on Twilio
	        'to': '+16469122974',//This value needs to be input by user
	        'applicationSid': '',
	        'statusCallback': '',
	        'accountSid': 'AC64dbef4652a8df236a618bd7c4febfea',//This is your Twilio accountSid number (from registering a Twilio account)
	        'accountToken': '1cdb01d17601b41a2249373e261f4c98',//This is your Twilio accountToken (from registering a Twilio account)
	        'messagingServiceSid': 'MG129363a532ef5de8ea673c663d720234',//This is your Twilio messagingSid number (from registering Twilio    messaging functionality)
	        'mediaUrl': gif, //This link will be generated by Giphy API
	        'maxPrice': '',
	        'provideFeedback': ''
	    }).on('success', (payload)=>{

	         console.log("Check your phone!");
	    }).on('error', (payload)=>{
	         console.log("Error sending MMS", payload);
	    });

	}).on('error', (payload)=>{
	    res.send("Error finding GIF");
	});
}

		