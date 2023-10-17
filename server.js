const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

/**
 * Configure CORS policy by...
 * - configuring CORS through Socket.io 4.0^ 
 * - setting Access-Control-Allow-Headers
 */
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
})

app.use(express.json());
app.use(function(req, res, next) {
    const allowedOrigins = [`http://localhost:3000`];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
    next();
})

/**
 * Create GameBoard with...
 * - initial state
 * - record of socket connections
 * - record of players with their positions
 */
const gameBoard = [];
for (let i = 0; i < 141; i++) {
    const row = [];
    for (let j = 0; j < 291; j++) {
        row.push("*");
    }
    gameBoard.push(row);
}
const socketConnections = {};   // { socketID: username }
const players = {}  // { socketID: [x, y, color, username] }

/**
 * Socket.io event listeners
 */
io.on("connection", socket => {
    console.log(`${socket.id} has connected`);

    /**
     * Once a client connects, they emit an initial "join-game" event
     * - save player's socketConnection in 'socketConnections'
     * - save player's initial position in 'players'
     */
    socket.on("join-game", playerData => {
        let username = playerData.username;
        let x = playerData.x;
        let y = playerData.y;
        let color = playerData.color;
        let id = socket.id;

        // ------------- DEBUG -------------
        // console.log("x:", x, ", y:", y);
        // ---------------------------------
        
        socketConnections[id] = username;
        players[id] = [x];
        players[id].push(y); 
        players[id].push(color);
        players[id].push(username);
        gameBoard[y][x] = socket.id;

        // ------------- DEBUG -------------
        console.log("players:", players)
        console.log("socketConnections:", socketConnections)
        // ---------------------------------

        // send other players' states to new player
        if (Object.entries(players).length > 1) {
            const otherPlayers = [];
            for (let key in players) {
                if (key !== id) {
                    otherPlayers.push([key, ...players[key]]);
                }
            }
            console.log("sending other player info to new player:", otherPlayers)
            socket.emit("initial-other-players-data", otherPlayers);

            // send new player's state to other players
            let newPlayerData = {
                id: socket.id,
                username: username,
                x: x,
                y: y,
                color: color,
            }
            socket.broadcast.emit("new-player-data", newPlayerData);
        }
    });

    /**
     * Records a player's change in movement to 'players' hashmap { socketID:[x, y] }
     */
    socket.on("update-position", newCoordinate => {
        let id = socket.id;
        let prevX = players[id][0];
        let prevY = players[id][1];
        gameBoard[prevY][prevX] = "*";
        
        players[id][0] = newCoordinate.x;
        players[id][1] = newCoordinate.y;
        gameBoard[newCoordinate.y][newCoordinate.x] = id;
        console.log("new player position: [" + newCoordinate.x + ", " + newCoordinate.y + "]");
        socket.emit("update-client-position", newCoordinate);
    });

    socket.on("disconnect", () => {
        // socketConnections = socketConnections.filter((sID) => sID.id !== socket.id);
    });
});


app.post('/playerInfo', (req, res) => {
    res.sendStatus(200);
})

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
})