// server/server.js
const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Start the Express server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Set up PeerJS server with HTTPS enabled for secure connections
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs',
    proxied: true,  // Necessary for Render's reverse proxy
    secure: true    // Ensure PeerJS connections are secure
});
app.use('/peerjs', peerServer);

// Serve index.html for any other GET request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
