const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

/**
 * Configure CORS policy by...
 * - configuring CORS through Socket.io 4.0^ 
 * - setting Access-Control-Allow-Headers
 */
const io = new Server(server, {
    cors: {
        origin: `http://${process.env.PRIVATE_IP}:${process.env.CLIENT_PORT}`,
    }
})
app.use(cors());
app.use(express.json());
app.use(function(req, res, next) {
    const allowedOrigins = [`http://${process.env.PRIVATE_IP}:${process.env.CLIENT_PORT}`];
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
 * - record of players with their coordinates, color, username
 */
const gameBoard = [];
for (let i = 0; i < 141; i++) {
    const row = [];
    for (let j = 0; j < 291; j++) {
        row.push("*");
    }
    gameBoard.push(row);

}

// *********************************************************
const players = {}  // { socketID: [x, y, color, username] }
// *********************************************************

function generateUniqueCoordinates() {
    let x, y;
    do {
        x = Math.floor(Math.random() * 290);
        y = Math.floor(Math.random() * 140);
    } while (coordinateExists(x, y));
    return [x, y];
}

function coordinateExists(x, y) {
    for (const socketID in players) {
        if (players[socketID][0] === x && players[socketID][1] === y) {
            return true;
        }
    }
    return false;
}

/**
 * Socket.io event listeners
 */
io.on("connection", socket => {
    /**
     * Once a client connects, they emit an initial "join-game" event
     * - save player's socketConnection in 'socketConnections'
     * - save player's initial coordinates, color, and username in 'players'
     */
    socket.on("join-game", playerData => {
        let username = playerData.username;
        let coordinate = generateUniqueCoordinates();
        let x = coordinate[0];
        let y = coordinate[1];
        let color = playerData.color;
        let id = socket.id;
        
        // push joining player's data to 'players' record
        // socketConnections[id] = username;
        players[id] = [x];
        players[id].push(y); 
        players[id].push(color);
        players[id].push(username);
        gameBoard[y][x] = socket.id;

        /**
         * if multiple people are in the game...
         * - send other players' coordinates, color, username to joining user
         * - send joining player's coordinates, color, username to other players
         */
        if (Object.entries(players).length > 1) {
            // create payload to send to joining player
            const otherPlayers = [];
            for (let key in players) {
                if (key !== id) {
                    otherPlayers.push([key, ...players[key]]);
                }
            }
            socket.emit("initial-other-players-data", otherPlayers);

            // create payload to send to all current players
            let newPlayerData = {
                id: socket.id,
                username: username,
                x: x,
                y: y,
                color: color,
            }
            socket.broadcast.emit("joining-player-data", newPlayerData);
        }
        socket.emit("update-client-position", { x, y });
    });

    /**
     * Records a player's change in position to 'players' hashmap { socketID:[x, y, color, username] }
     */
    socket.on("update-position", newCoordinate => {
        // remove player from previous position on 'gameBoard'
        let id = socket.id;
        let prevX = players[id][0];
        let prevY = players[id][1];
        gameBoard[prevY][prevX] = "*";
        
        // update 'gameBoard' with the correct position
        players[id][0] = newCoordinate.x;
        players[id][1] = newCoordinate.y;
        gameBoard[newCoordinate.y][newCoordinate.x] = id;

        // player's updated coordinate -> player's client
        socket.emit("update-client-position", newCoordinate);

        // player's update coordinate -> other players' clients
        if (Object.entries(players).length > 1) {
            const playerUpdates = {
                id: id,
                x: newCoordinate.x,
                y: newCoordinate.y
            }
            socket.broadcast.emit("update-other-player-position", playerUpdates);
        }
    });

    socket.on("disconnect", () => {
        // remove player from players record and gameboard
        
        let id = socket.id;
        
        if (id in players) {
            let x = players[id][0];
            let y = players[id][1];
            gameBoard[y][x] = "*";
            delete players[id];
        }

        // notify clients of disconnection
        socket.broadcast.emit("player-disconnected", id);
    });
});


app.post('/playerInfo', (req, res) => {
    res.sendStatus(200);
})

server.listen(process.env.SERVER_PORT, process.env.PRIVATE_IP, () => {
    console.log("server is listening");
})
