// server/server.js
const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Set up PeerJS server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);

// Serve index.html for any other GET request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
