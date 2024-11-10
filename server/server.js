// server/server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', socket.id);
    });

    // Handle WebRTC offer
    socket.on('offer', ({ roomId, offer }) => {
        socket.to(roomId).emit('receive-offer', { senderId: socket.id, offer });
    });

    // Handle WebRTC answer
    socket.on('answer', ({ roomId, answer }) => {
        socket.to(roomId).emit('receive-answer', { senderId: socket.id, answer });
    });

    // Handle ICE candidates
    socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('receive-candidate', { senderId: socket.id, candidate });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
