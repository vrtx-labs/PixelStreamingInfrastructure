// Copyright Epic Games, Inc. All Rights Reserved.
// With extensions by Oracle and VRTX Labs
var enableRedirectionLinks = true;
var enableRESTAPI = true;

const defaultConfig = {
	// The port clients connect to the matchmaking service over HTTP
	HttpPort: 80,
	UseHTTPS: false,
	// The matchmaking port the signaling service connects to the matchmaker
	MatchmakerPort: 9999,

	// Log to file
	LogToFile: true
};

// Similar to the Signaling Server (SS) code, load in a config.json file for the MM parameters
const argv = require('yargs').argv;

var configFile = (typeof argv.configFile != 'undefined') ? argv.configFile.toString() : 'config.json';
console.log(`configFile ${configFile}`);
const config = require('./modules/config.js').init(configFile, defaultConfig);
console.log("Config: " + JSON.stringify(config, null, '\t'));

const express = require('express');
var cors = require('cors');
const app = express();
const http = require('http').Server(app);
const fs = require('fs');
const path = require('path');
const logging = require('./modules/logging.js');
logging.RegisterConsoleLogger();

if (config.LogToFile) {
	logging.RegisterFileLogger('./logs');
}

// A list of all the Cirrus servers which are connected to the Matchmaker.
var cirrusServers = new Map();

//
// Parse command line.
//

if (typeof argv.HttpPort != 'undefined') {
	config.HttpPort = argv.HttpPort;
}
if (typeof argv.MatchmakerPort != 'undefined') {
	config.MatchmakerPort = argv.MatchmakerPort;
}

http.listen(config.HttpPort, () => {
    console.log('HTTP listening on *:' + config.HttpPort);
});

if (config.UseHTTPS) {
	//HTTPS certificate details
	const options = {
		key: fs.readFileSync(path.join(__dirname, './certificates/client-key.pem')),
		cert: fs.readFileSync(path.join(__dirname, './certificates/client-cert.pem'))
	};

	var https = require('https').Server(options, app);

	//Setup http -> https redirect
	console.log('Redirecting http->https');
	app.use(function (req, res, next) {
		if (!req.secure) {
			if (req.get('Host')) {
				var hostAddressParts = req.get('Host').split(':');
				var hostAddress = hostAddressParts[0];
				if (httpsPort != 443) {
					hostAddress = `${hostAddress}:${httpsPort}`;
				}
				return res.redirect(['https://', hostAddress, req.originalUrl].join(''));
			} else {
				console.error(`unable to get host name from header. Requestor ${req.ip}, url path: '${req.originalUrl}', available headers ${JSON.stringify(req.headers)}`);
				return res.status(400).send('Bad Request');
			}
		}
		next();
	});

	https.listen(443, function () {
		console.log('Https listening on 443');
	});
}

// No servers are available so send some simple JavaScript to the client to make
// it retry after a short period of time.
function sendRetryResponse(res) {
	res.send(`All ${cirrusServers.size} Cirrus servers are in use. Retrying in <span id="countdown">3</span> seconds.
	<script>
		var countdown = document.getElementById("countdown").textContent;
		setInterval(function() {
			countdown--;
			if (countdown == 0) {
				window.location.reload(1);
			} else {
				document.getElementById("countdown").textContent = countdown;
			}
		}, 1000);
	</script>`);
}

// Get a Cirrus server if there is one available which has no clients connected.
function getAvailableCirrusServer() {
	for (const [connection, cirrusServer] of cirrusServers.entries()) { // VRTX: Use destructuring for clarity
		if (cirrusServer.numConnectedClients === 0 && cirrusServer.ready === true) {

			// Check if we had at least 10 seconds since the last redirect, avoiding the 
			// chance of redirecting 2+ users to the same SS before they click Play.
			// In other words, give the user 10 seconds to click play button to claim the server.
			if (cirrusServer.hasOwnProperty('lastRedirect')) {
				if (((Date.now() - cirrusServer.lastRedirect) / 1000) < 10)
					continue;
			}
			cirrusServer.lastRedirect = Date.now();

			return cirrusServer;
		}
	}
	
	console.log('WARNING: No empty Cirrus servers are available');
	return undefined;
}

if (enableRESTAPI) {
	// Handle REST signalling server only request.
	app.options('/signallingserver', cors());
	app.get('/signallingserver', cors(), (req, res) => {
		const cirrusServer = getAvailableCirrusServer();
		if (cirrusServer != undefined) {
			res.json({ signallingServer: `${cirrusServer.address}:${cirrusServer.port}` });
			console.log(`Returning ${cirrusServer.address}:${cirrusServer.port}`);
		} else {
			res.json({ signallingServer: '', error: 'No signalling servers available' });
		}
	});

	// VRTX: Add an endpoint to inspect the cirrusServers map for debugging purposes
	app.get('/inspect/cirrus-servers', cors(), (req, res) => {
		const servers = [...cirrusServers.entries()].map(([connection, server]) => ({
			address: server.address,
			port: server.port,
			numConnectedClients: server.numConnectedClients,
			ready: server.ready,
			lastPingReceived: server.lastPingReceived,
			lastRedirect: server.lastRedirect,
		}));
		res.json(servers);
	});

}

if (enableRedirectionLinks) {
	// Handle standard URL.
	app.get('/', (req, res) => {
		const cirrusServer = getAvailableCirrusServer();
		if (cirrusServer != undefined) {
			res.redirect(`http://${cirrusServer.address}:${cirrusServer.port}/`);
			console.log(`Redirect to ${cirrusServer.address}:${cirrusServer.port}`);
		} else {
			sendRetryResponse(res);
		}
	});

	// Handle URL with custom HTML.
	app.get('/custom_html/:htmlFilename', (req, res) => {
		const cirrusServer = getAvailableCirrusServer();
		if (cirrusServer != undefined) {
			res.redirect(`http://${cirrusServer.address}:${cirrusServer.port}/custom_html/${req.params.htmlFilename}`);
			console.log(`Redirect to ${cirrusServer.address}:${cirrusServer.port}`);
		} else {
			sendRetryResponse(res);
		}
	});
}

//
// Connection to Cirrus.
//

const net = require('net');

function disconnect(connection) {
	console.log(`Ending connection to remote address ${connection.remoteAddress}`);
	connection.end();
}

const matchmaker = net.createServer((connection) => {
	connection.on('data', (data) => {
		try {
			message = JSON.parse(data);

			if (message)
				console.log(`Message TYPE: ${message.type}`);
		} catch (e) {
			console.log(`ERROR (${e.toString()}): Failed to parse Cirrus information from data: ${data.toString()}`);
			disconnect(connection);
			return;
		}

		let cirrusServer = cirrusServers.get(connection); // VRTX: Retrieve existing server if any

		if (message.type === 'connect') {
			// A Cirrus server connects to this Matchmaker server.
			const newServer = {
				address: message.address,
				port: message.port,
				numConnectedClients: message.playerConnected ? 1 : 0, // VRTX: Simplify the client count logic
				lastPingReceived: Date.now(),
				ready: message.ready === true
			};

			if (cirrusServer) {
				// VRTX: Update the existing server instead of adding a duplicate
				cirrusServers.set(connection, { ...cirrusServer, ...newServer });
				console.log(`Updated existing connection for ${newServer.address.split(".")[0]}`);
			} else {
				// VRTX: Ensure no duplicates by checking if a server with the same address and port already exists
				const duplicateServer = [...cirrusServers.values()].find(server => server.address === newServer.address && server.port === newServer.port);
				if (duplicateServer) {
					console.log(`Duplicate server detected. Replacing old entry for ${newServer.address.split(".")[0]}`);
					// VRTX: Remove the old entry before adding the new one
					for (const [key, server] of cirrusServers.entries()) {
						if (server.address === newServer.address && server.port === newServer.port) {
							cirrusServers.delete(key);
							break;
						}
					}
				}
				cirrusServers.set(connection, newServer);
				console.log(`Added new connection for ${newServer.address.split(".")[0]}`);
			}
		} else if (message.type === 'streamerConnected') {
			if (cirrusServer) {
				cirrusServer.ready = true;
				console.log(`Cirrus server ${cirrusServer.address}:${cirrusServer.port} ready for use`);
			} else {
				disconnect(connection);
			}
		} else if (message.type === 'streamerDisconnected') {
			if (cirrusServer) {
				cirrusServer.ready = false;
				console.log(`Cirrus server ${cirrusServer.address}:${cirrusServer.port} no longer ready for use`);
			} else {
				disconnect(connection);
			}
		} else if (message.type === 'clientConnected') {
			if (cirrusServer) {
				cirrusServer.numConnectedClients++;
				console.log(`Client connected to Cirrus server ${cirrusServer.address}:${cirrusServer.port}`);
			} else {
				disconnect(connection);
			}
		} else if (message.type === 'clientDisconnected') {
			if (cirrusServer) {
				cirrusServer.numConnectedClients--;
				console.log(`Client disconnected from Cirrus server ${cirrusServer.address}:${cirrusServer.port}`);
				if (cirrusServer.numConnectedClients === 0) {
					cirrusServer.lastRedirect = 0;
				}
			} else {
				disconnect(connection);
			}
		} else if (message.type === 'ping') {
			if (cirrusServer) {
				cirrusServer.lastPingReceived = Date.now();
			} else {
				disconnect(connection);
			}
		} else {
			console.log('ERROR: Unknown data: ' + JSON.stringify(message));
			disconnect(connection);
		}
	});

	// A Cirrus server disconnects from this Matchmaker server.
	connection.on('error', () => {
		const cirrusServer = cirrusServers.get(connection);
		if (cirrusServer) {
			cirrusServers.delete(connection);
			console.log(`Cirrus server ${cirrusServer.address}:${cirrusServer.port} disconnected from Matchmaker`);
		} else {
			console.log(`Disconnected machine that wasn't a registered cirrus server, remote address: ${connection.remoteAddress}`);
		}
	});
});

matchmaker.listen(config.MatchmakerPort, () => {
	console.log('Matchmaker listening on *:' + config.MatchmakerPort);
});

// VRTX: Periodic cleanup of stale entries
setInterval(() => {
	const staleThreshold = Date.now() - 60000; // 1 minute threshold
	for (const [connection, server] of cirrusServers.entries()) {
		if (server.lastPingReceived < staleThreshold && server.numConnectedClients === 0) {
			cirrusServers.delete(connection);
			console.log(`Removed stale entry for ${server.address}:${server.port}`);
		}
	}
}, 60000); // Run cleanup every minute

// MV: expose necessary objects to the wrapper
module.exports = {
	app,
	http,
	config,
	matchmaker,
	cirrusServers,
};
