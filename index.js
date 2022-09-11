const WebSocket = require("ws");
const querystring = require("querystring");
const server = require("http").createServer();

const port = 3000;

var connectionList = [];

server.listen(port, () => {
    console.log("Server Started..")
})

const wss = new WebSocket.Server({
    server,
    path: "/ws"
});

wss.on("connection", function (ws, req) {
    console.log("new Connection is coming..")

    var roomId = querystring.parse(req.url.split("?")[1]).roomId;

    if (connectionList[roomId] == undefined) {
        connectionList[roomId] = [];
    }

    connectionList[roomId].push(ws);

    console.log("room (" + roomId + ") has - " + connectionList[roomId].length + " connections")
    sendConnectionStatus(roomId)

    ws.on("message", function (msg) {
        console.log("new msg ..")
        var message = msg.toString("utf8");
        broadCast(roomId, message);
    })

    ws.on("close", function () {
        console.log("close connection")
        disconnectConnections(roomId, ws)
        console.log("room (" + roomId + ") has - " + connectionList[roomId].length + " connections")
        sendConnectionStatus(roomId)
    })
})

function sendConnectionStatus(roomId) {
    var initMsg = {
        "type": "info",
        "count": connectionList[roomId].length
    }
    broadCast(roomId, JSON.stringify(initMsg));
}

function broadCast(roomId, message) {
    if (connectionList[roomId] != undefined) {
        try {
            connectionList[roomId].forEach(function (conn, i) {
                conn.send(message);
            })
        } catch (error) {
            console.log(error);
        }
    }
}


function disconnectConnections(roomId, ws) {
    connectionList[roomId].forEach(function (conn, i) {
        if (conn === ws) {
            connectionList[roomId].splice(i, 1);
        }
    });
}
