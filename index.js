var port = process.env.PORT || 3000;

var io = require('socket.io')(port);
var shortid = require('shortid');

console.log("Express server listening on port %s", port);

var playerList = {};
var energyCount = 0;

console.log('Starting the server');

io.on('connection', function (socket) {
    var sessionId = shortid.generate();

    createSession(socket, sessionId);

    broadcastSession(socket, sessionId);

    playerList[sessionId] = true;

    socket.on('gameover', function (data) {
        energyCount = 0;
    });

    socket.on('enemy', function (data) {
        socket.broadcast.emit('enemy', data);
    });

    socket.on('move', function (data) {
        socket.broadcast.emit('move', data);
    });

    socket.on('mothership', function (data) {
        energyCount += data.q;
        socket.broadcast.emit('mothership', data);
    });

    socket.on('disconnect', function () {
        console.log('Disconnectiong client');
        delete playerList[sessionId];
        socket.broadcast.emit('unspawn', {
            s: sessionId
        });

        if (Object.keys(playerList).length == 0) {
            console.log('No clients on the server. Reseting energy count.');
            energyCount = 0;
        }
    });
});

function createSession(socket, sessionId) {
    console.log('client connected, sessionid: ' + sessionId);

    socket.emit('session', {
        s: sessionId,
        q: energyCount
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