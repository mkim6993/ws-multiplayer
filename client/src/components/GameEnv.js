import React, { useEffect, useRef } from 'react';
import { useParams } from "react-router-dom";
import "./GameEnv.css";
import { io } from "socket.io-client";
import Player from "./classes/Player";

const GameEnv = () => {
    const socketRef = useRef(io("http://192.168.4.126:8000/"));
    const { username } = useParams();
    const gameboardGrid = useRef(null);
    // const gameBoardCanvas = useRef();
    const gameBoardX = useRef();
    const gameBoardY = useRef();
    const ctx = useRef();

    /**
     * other players in the game
     * { socketID: { username, x, y, speed, width, height, color } }
     */
    const OtherPlayers = useRef({});

    /**
     * current client's character state.
     * { username, x, y, speed, width, height, color }
     */
    const PlayerCurrent = useRef();

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
        let speed = PlayerCurrent.current.speed;
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

        // let changeInX = Math.max(0, Math.min(gameBoardCanvas.current.width - PlayerCurrent.current.width, x));
        // let changeInY = Math.max(0, Math.min(gameBoardCanvas.current.height - PlayerCurrent.current.height, y));
        
        // console.log("2. calculated new coordinate: new coordinate", changeInX, changeInY);
        // sendMovementData(changeInX, changeInY)
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
        // console.log("1. keydown recognized: original", PlayerCurrent.current.x, PlayerCurrent.current.y)
        updatePlayerMovement(PlayerCurrent.current.x, PlayerCurrent.current.y);
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
     * Updates client's immediate gameboard canvas
     */
    function updateClientDisplay() {
        console.log("updating gameboard canvas")
        // console.log("6. filling display with new position: new coord", PlayerCurrent.current.x, PlayerCurrent.current.y);
        // // ctx.current.clearRect(0, 0, gameBoardCanvas.current.width, gameBoardCanvas.current.height);
        // Draw the client player
        ctx.current.fillStyle = PlayerCurrent.current.playerColor;
        ctx.current.fillRect(PlayerCurrent.current.x, PlayerCurrent.current.y, PlayerCurrent.current.width, PlayerCurrent.current.height);

        Object.values(OtherPlayers.current).forEach((player) => {
            ctx.current.fillStyle = player.playerColor;
            ctx.current.fillRect(player.x, player.y, player.width, player.height);
        })
    }


    useEffect(() => {
        /**
         * gameboard grid setup
         */
        const gameboard = gameboardGrid.current;
        const gridItems = [];

        for (let i = 0; i < 5000; i++) {
            const gridItem = document.createElement("div");
            gridItem.classList.add("gridBox");
            gridItems.push(gridItem);
            gameboard.appendChild(gridItem);
        }

        /**
         * Place current player in random position, assign color, create Player obj
         */
        let x = Math.floor(Math.random()*290);
        let y = Math.floor(Math.random()*140);
        let color = "#" + Math.floor(Math.random()*16777215).toString(16);
        PlayerCurrent.current = new Player(
            username,
            x,
            y, 
            1, 
            10, 
            10, 
            color
        );

        /**
         * Send current player information to server
         */
        const initialPlayerInfo = {
            username: username,
            x: x,
            y: y,
            color: color
        }
        socketRef.current.emit("join-game", initialPlayerInfo);
        // const board = document.getElementById("gameboard");
        // ctx.current = board.getContext("2d");
        // const boardDimensions = board.getBoundingClientRect();
        // gameBoardX.current = boardDimensions.x;
        // gameBoardY.current = boardDimensions.y;
        // gameBoardCanvas.current = board;

        socketRef.current.on("update-client-position", newCoordinate => {
            // console.log("4. received updated coordinate from server, player coordinates set: received", newCoordinate.x, newCoordinate.y);
            PlayerCurrent.current.x = newCoordinate.x;
            PlayerCurrent.current.y = newCoordinate.y;
            // updateClientDisplay()
        });

        // add new player to client's game state
        socketRef.current.on("joining-player-data", newPlayerData => {
            OtherPlayers.current[newPlayerData.id] = new Player(
                newPlayerData.username,
                newPlayerData.x,
                newPlayerData.y,
                1,
                10,
                10,
                newPlayerData.color,
            );
            // updateClientDisplay()
        });

        /**
         * receive other player's data, otherPlayers = [socketID, username, x, y, color]
         */
        socketRef.current.on("initial-other-players-data", otherPlayers => {
            otherPlayers.forEach((playerData) => {
                OtherPlayers.current[playerData[0]] = new Player(
                    playerData[4], 
                    playerData[1], 
                    playerData[2],
                    1,
                    10,
                    10,
                    playerData[3],
                );
            });
            // updateClientDisplay()
        });

        /**
         * receive an update on another player's position.
         * playerUpdates : { id, x, y }
         */
        socketRef.current.on("update-other-player-position", playerUpdates => {
            // console.log("OtherPlayers:", OtherPlayers.current)
            // console.log("OtherplayerID:", playerUpdates.id);
            if (playerUpdates.id in OtherPlayers.current) {
                OtherPlayers.current[playerUpdates.id].x = playerUpdates.x
                OtherPlayers.current[playerUpdates.id].y = playerUpdates.y
                // updateClientDisplay()
            }
        });

        /**
         * receive notification for a disconnecting player,
         */
        socketRef.current.on("player-disconnected", id => {
            delete OtherPlayers.current[id];
            // updateClientDisplay()
        });

        // updateClientDisplay()
        return () => {
            
            socketRef.current.disconnect();
        };
    }, []);
    return (
        <>
            <div id="GameEnvironment">
                <p>Hello {username}!</p>
                <div ref={gameboardGrid} id="gameboard"></div>
            </div>
        </>
    )
}

export default GameEnv