const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
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

// Game Board
const players = {}

const gameBoard = new Array(140);
for (let i = 0; i < 140; i++) {
    const row = [];
    for (let j = 0; j < 290; j++) {
        row.push("*");
    }
    gameBoard.push(row);
}
let socketConnections = {};

io.on("connection", socket => {
    console.log(`${socket.id} has connected`);


    console.log("socket.io connection successful");
    socket.on("join-game", playerData => {
        let username = playerData.username;
        let x = playerData.x;
        let y = playerData.y;
        console.log("x:", x, ", y:", y);
        console.log("socketid:", socket.id);
        socketConnections[socket.id] = username;
        players[username].push(x);
        players[username].push(y); 
        gameBoard[x][y] = socket.id; 
        
        console.log("player placed on gameboard");
        console.log(username, ":", gameBoard[x][y]);
        console.log("players:", players)
        console.log("socketConnections:", socketConnections)
    });

    socket.on("disconnect", () => {
        // socketConnections = socketConnections.filter((sID) => sID.id !== socket.id);
    })
});

app.post('/playerInfo', (req, res) => {
    const { username } = req.body;
    players[username] = [];
    res.sendStatus(200);
})

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
})