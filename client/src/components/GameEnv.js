import React, { useEffect, useRef, useState } from 'react';
import { useParams } from "react-router-dom";
import "./GameEnv.css";
import { io } from "socket.io-client";

// const Player = {
//     x: 0,
//     y: 0,
//     speed: 1,
//     width: 10,
//     height: 10,
// };

const GameEnv = () => {
    const socketRef = useRef(io("http://localhost:8000"));
    const { username } = useParams();
    const gameBoardCanvas = useRef();
    const gameBoardX = useRef();
    const gameBoardY = useRef();
    const ctx = useRef();
    const [boardCoordinates, setBoardCoordinates] = useState({ x: 0, y: 0 });

    const Player = useRef({
        x: 0,
        y: 0,
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

    function updatePlayerMovement() {
        if (playerMovement.left && playerMovement.up) {
            Player.current.x -= Player.current.speed;
            Player.current.y -= Player.current.speed;
          }
        if (playerMovement.left && playerMovement.down) {
            Player.current.x -= Player.current.speed;
            Player.current.y += Player.current.speed;
        }
        if (playerMovement.right && playerMovement.up) {
            Player.current.x += Player.current.speed;
            Player.current.y -= Player.current.speed;
        }
        if (playerMovement.right && playerMovement.down) {
            Player.current.x += Player.current.speed;
            Player.current.y += Player.current.speed;
        }
        if (playerMovement.left) {
            Player.current.x -= Player.current.speed * 2;
        }
        if (playerMovement.right) {
            Player.current.x += Player.current.speed * 2;
        }
        if (playerMovement.up) {
            Player.current.y -= Player.current.speed * 2;
        }
        if (playerMovement.down) {
            Player.current.y += Player.current.speed * 2;
        }

        Player.current.x = Math.max(0, Math.min(gameBoardCanvas.current.width - Player.current.width, Player.current.x));
        Player.current.y = Math.max(0, Math.min(gameBoardCanvas.current.height - Player.current.height, Player.current.y));
    }

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
        }
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
        }
    });

    function update() {
        updatePlayerMovement();
        console.log(Player.current.x, Player.current.y)
        ctx.current.clearRect(0, 0, gameBoardCanvas.current.width, gameBoardCanvas.current.height);

        // Draw the player
        ctx.current.fillStyle = "red";
        ctx.current.fillRect(Player.current.x, Player.current.y, Player.current.width, Player.current.height);

        // Request the next animation frame
        requestAnimationFrame(update);
    }


    useEffect(() => {
        const board = document.getElementById("gameboard");
        ctx.current = board.getContext("2d");
        const boardDimensions = board.getBoundingClientRect();
        gameBoardX.current = boardDimensions.x;
        gameBoardY.current = boardDimensions.y;
        gameBoardCanvas.current = board;

        setBoardCoordinates({ x: gameBoardX.current, y: gameBoardY.current });
        update()
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