let peer = null;
let currentCall = null;
let localStream;
let screenSharing = false;

function createRoom() {
    const roomId = document.getElementById("room-input").value;
    if (!roomId) {
        alert("Please enter a room ID.");
        return;
    }
    
    peer = new Peer(roomId, {
        host: 'sahayk-webrtc.onrender.com', // Replace with your Render URL
        port: 443,                          // Use 443 for HTTPS
        path: '/peerjs',                    // PeerJS server path
        secure: true                        // Secure connection
    });

    peer.on('open', () => {
        notify("Room created. Waiting for a participant to join.");
        getUserMedia();
    });

    peer.on('call', (call) => {
        call.answer(localStream);
        call.on('stream', (stream) => setRemoteStream(stream));
        currentCall = call;
    });
}

function joinRoom() {
    const roomId = document.getElementById("room-input").value;
    if (!roomId) {
        alert("Please enter a room ID.");
        return;
    }
    
    peer = new Peer({
        host: 'sahayk-webrtc.onrender.com', // Replace with your Render URL
        port: 443,
        path: '/peerjs',
        secure: true
    });

    peer.on('open', () => {
        notify("Joining room...");
        getUserMedia(() => {
            const call = peer.call(roomId, localStream);
            call.on('stream', (stream) => setRemoteStream(stream));
            currentCall = call;
        });
    });
}

function getUserMedia(callback) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            setLocalStream(localStream);
            if (callback) callback();
        })
        .catch((err) => console.error("Failed to access media devices:", err));
}

function setLocalStream(stream) {
    document.getElementById("local-vid-container").hidden = false;
    const localVideo = document.getElementById("local-video");
    localVideo.srcObject = stream;
}

function setRemoteStream(stream) {
    document.getElementById("remote-vid-container").hidden = false;
    const remoteVideo = document.getElementById("remote-video");
    remoteVideo.srcObject = stream;
}

function startScreenShare() {
    if (screenSharing) {
        stopScreenSharing();
        return;
    }
    
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
            screenSharing = true;
            const screenVideoTrack = stream.getVideoTracks()[0];
            const screenAudioTrack = stream.getAudioTracks()[0];
            screenVideoTrack.onended = () => stopScreenSharing();

            const videoSender = currentCall.peerConnection.getSenders().find(sender => sender.track.kind === 'video');
            const audioSender = currentCall.peerConnection.getSenders().find(sender => sender.track.kind === 'audio');
            if (videoSender) videoSender.replaceTrack(screenVideoTrack);
            if (audioSender) audioSender.replaceTrack(screenAudioTrack);
        })
        .catch((err) => console.error("Error sharing screen:", err));
}

function stopScreenSharing() {
    if (!screenSharing) return;
    screenSharing = false;
    const videoSender = currentCall.peerConnection.getSenders().find(sender => sender.track.kind === 'video');
    const audioSender = currentCall.peerConnection.getSenders().find(sender => sender.track.kind === 'audio');
    if (videoSender) videoSender.replaceTrack(localStream.getVideoTracks()[0]);
    if (audioSender) audioSender.replaceTrack(localStream.getAudioTracks()[0]);
}

function notify(message) {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.hidden = false;
    setTimeout(() => notification.hidden = true, 3000);
}
