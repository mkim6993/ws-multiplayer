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


app.post('/playerInfo', (req, res) => {
    const { username } = req.body;
    res.sendStatus(200);
})

// Game Board


io.on("connection", socket => {
    console.log("socket.io connection successful");
})

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
})