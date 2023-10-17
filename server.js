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
const players = {}  // { socketID: [x, y] }

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

        // ------------- DEBUG -------------
        // console.log("x:", x, ", y:", y);
        // ---------------------------------
        
        socketConnections[socket.id] = username;
        players[socket.id] = [x];
        players[socket.id].push(y); 
        gameBoard[y][x] = socket.id;

        // ------------- DEBUG -------------
        console.log("players:", players)
        console.log("socketConnections:", socketConnections)
        // ---------------------------------


        // need to send other players' states to new player

        // need to send new player's state to other players
    });

    /**
     * Records a player's change in movement to 'players' hashmap { socketID:[x, y] }
     */
    socket.on("update-position", newCoordinate => {
        players[socket.id][0] = newCoordinate.x;
        players[socket.id][1] = newCoordinate.y;
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