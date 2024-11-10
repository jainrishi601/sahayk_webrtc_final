// server/server.js
const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000; // Default to 10000 if no PORT is set by Render

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Start Express server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Configure PeerJS server with options to work with Render's proxy
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs',
    proxied: true,  // Enable proxy support for Render
    secure: true    // Enforce secure connection (HTTPS)
});

app.use('/peerjs', peerServer);

// Fallback route to serve index.html for any undefined route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
