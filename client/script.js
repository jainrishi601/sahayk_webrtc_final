const socket = io();
let localStream, remoteStream, peerConnection;
let roomId;

async function joinRoom() {
    roomId = document.getElementById('room-id').value;
    if (!roomId) {
        alert('Please enter a room ID');
        return;
    }
    socket.emit('join-room', roomId);

    socket.on('user-joined', handleUserJoined);
    socket.on('receive-offer', handleOffer);
    socket.on('receive-answer', handleAnswer);
    socket.on('receive-candidate', handleCandidate);
}

async function startVideo() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('local-video').srcObject = localStream;
    initializePeerConnection();
}

function initializePeerConnection() {
    peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('ice-candidate', { roomId, candidate });
    };
    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        document.getElementById('remote-video').srcObject = remoteStream;
    };
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
}

async function handleUserJoined() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', { roomId, offer });
}

async function handleOffer({ senderId, offer }) {
    initializePeerConnection();
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', { roomId, answer });
}

async function handleAnswer({ answer }) {
    await peerConnection.setRemoteDescription(answer);
}

async function handleCandidate({ candidate }) {
    await peerConnection.addIceCandidate(candidate);
}

async function startScreenShare() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const screenTrack = screenStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find((s) => s.track.kind === 'video');
    if (sender) sender.replaceTrack(screenTrack);

    screenTrack.onended = () => stopScreenShare();
}

function stopScreenShare() {
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find((s) => s.track.kind === 'video');
    if (sender) sender.replaceTrack(videoTrack);
}
