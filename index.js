var io = require('socket.io')(process.env.PORT || 3000);
var shortid = require('shortid');

console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);

var playerList = {};

console.log('Starting the server');

io.on('connection', function (socket) {
    var sessionId = shortid.generate();

    createSession(socket, sessionId);

    broadcastSession(socket, sessionId);

    playerList[sessionId] = true;

    socket.on('enemy', function (data) {
        socket.broadcast.emit('enemy', data);
    });

    socket.on('move', function (data) {
        socket.broadcast.emit('move', data);
    });

    socket.on('mothership', function (data) {
        socket.broadcast.emit('mothership', data);
    });

    socket.on('disconnect', function () {
        console.log('Disconnectiong client');
        delete playerList[sessionId];
        socket.broadcast.emit('unspawn', {
            s: sessionId
        });
    });
});

function createSession(socket, sessionId) {
    console.log('client connected, sessionid: ' + sessionId);

    socket.emit('session', {
        s: sessionId
    });

    for (var i in playerList) {
        socket.emit('spawn', {
            s: i
        });
    }
}

function broadcastSession(socket, sessionId) {
    console.log('client connected, broadcasting spawn');

    socket.broadcast.emit('spawn', {
        s: sessionId
    });
}