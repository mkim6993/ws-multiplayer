import React, { useEffect, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import "./GameEnv.css";
import { io } from "socket.io-client";

const GameEnv = () => {
    const socketRef = useRef(io("http://localhost:8000"));
    const { username } = useParams();
    const gameBoardCanvas = useRef();
    const gameBoardX = useRef();
    const gameBoardY = useRef();
    const ctx = useRef();
    const [boardCoordinates, setBoardCoordinates] = useState({ x: 0, y: 0 });

    const Player = useRef({
        x: Math.floor(Math.random()*290),
        y: Math.floor(Math.random()*140),
        // x: 290,
        // y: 140,
        speed: 1,
        width: 10,
        height: 10,
    });

    const playerMovement = {
        left: false,
        right: false,
        up: false,
        down: false,
    }

    /**
     * updates player movement values and sends coordinates to game state
     */
    function updatePlayerMovement(x, y) {
        let speed = Player.current.speed;
        if (playerMovement.left && playerMovement.up) {
            x -= speed;
            y -= speed;
          }
        if (playerMovement.left && playerMovement.down) {
            x -= speed;
            y += speed;
        }
        if (playerMovement.right && playerMovement.up) {
            x += speed;
            y -= speed;
        }
        if (playerMovement.right && playerMovement.down) {
            x += speed;
            y += speed;
        }
        if (playerMovement.left) {
            x -= speed * 2;
        }
        if (playerMovement.right) {
            x += speed * 2;
        }
        if (playerMovement.up) {
            y -= speed * 2;
        }
        if (playerMovement.down) {
            y += speed * 2;
        }

        let changeInX = Math.max(0, Math.min(gameBoardCanvas.current.width - Player.current.width, x));
        let changeInY = Math.max(0, Math.min(gameBoardCanvas.current.height - Player.current.height, y));
        
        // console.log("2. calculated new coordinate: new coordinate", changeInX, changeInY);
        sendMovementData(changeInX, changeInY)
    }

    /**
     * Send current player position to server game state
     */
    function sendMovementData(x, y) {
        const movementData = {
            x: x,
            y: y,
        }
        // console.log("3. emitting updated position:", x, y);
        socketRef.current.emit("update-position", movementData)
    }

    /**
     * listens for key
     */
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "a":
                playerMovement.left = true;
                break;
            case "d":
                playerMovement.right = true;
                break;
            case "w":
                playerMovement.up = true;
                break;
            case "s":
                playerMovement.down = true;
                break;
            default:
                return;
        }
        // console.log("1. keydown recognized: original", Player.current.x, Player.current.y)
        updatePlayerMovement(Player.current.x, Player.current.y);
    });
    

    document.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "a":
                playerMovement.left = false;
                break;
            case "d":
                playerMovement.right = false;
                break;
            case "w":
                playerMovement.up = false;
                break;
            case "s":
                playerMovement.down = false;
                break;
            default:
                return;
        }
    });

    /**
     * Canvas loop that updates player movement and game display
     */
    function update() {
        // console.log("5. updating client display with coordinates")
        updateClientDisplay();
    }

    /**
     * Updates client's immediate gameboard canvas
     */
    function updateClientDisplay() {
        console.log("updating gameboard canvas")
        // console.log("6. filling display with new position: new coord", Player.current.x, Player.current.y);
        ctx.current.clearRect(0, 0, gameBoardCanvas.current.width, gameBoardCanvas.current.height);

        // Draw the player
        ctx.current.fillStyle = "red";
        ctx.current.fillRect(Player.current.x, Player.current.y, Player.current.width, Player.current.height);

        // Request the next animation frame

        requestAnimationFrame(update);
    }


    useEffect(() => {
        const initialPlayerInfo = {
            username: username,
            x: Player.current.x,
            y: Player.current.y,
        }
        console.log(socketRef.current);
        socketRef.current.emit("join-game", initialPlayerInfo);
        const board = document.getElementById("gameboard");
        ctx.current = board.getContext("2d");
        const boardDimensions = board.getBoundingClientRect();
        gameBoardX.current = boardDimensions.x;
        gameBoardY.current = boardDimensions.y;
        gameBoardCanvas.current = board;
        setBoardCoordinates({ x: gameBoardX.current, y: gameBoardY.current });

        socketRef.current.on("update-client-position", newCoordinate => {
            // console.log("4. received updated coordinate from server, player coordinates set: received", newCoordinate.x, newCoordinate.y);
            Player.current.x = newCoordinate.x;
            Player.current.y = newCoordinate.y;
        });

        update();
    }, [])
    return (
        <>
            <div id="GameEnvironment">
                <p>Hello {username}!</p>
                <canvas id="gameboard"></canvas>
            </div>
        </>
    )
}

export default GameEnv