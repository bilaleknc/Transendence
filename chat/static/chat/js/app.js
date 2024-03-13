const roomName = JSON.parse(document.getElementById('room-name').textContent);
alert("roomName: " + roomName);

// Create a WebSocket connection to the server
const chatSocket = new WebSocket(
    'ws://' + window.location.host +
    '/ws/chat/' + roomName + '/');

    