const socket = io();

socket.on('connect', function() {
    console.log('Connected to server.');
});
socket.on('disconnect', function() {
    console.log('Disconnected from server.');
});

function chkCase(elem) {
    var temp = elem.value;
    elem.value = temp.toLowerCase();
};