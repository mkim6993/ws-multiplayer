import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./GameEnv.css";
import { io } from "socket.io-client";
import Player from "./classes/Player";

/**
 * Represents the game environment for the current client
 * - emits socket events for current player's join, disconnect, and movement actions
 * - receives socket events for other players' join, disconnect, and movement actions
 * - keeps track of each player's state
 * - reads current player's keydown and keyup events
 */
const GameEnv = () => {
    const socketRef = useRef(io(`http://${process.env.REACT_APP_PRIVATE_IP}:${process.env.REACT_APP_SERVER_PORT}`));
    const navigate = useNavigate();
    const { username } = useParams();
    const { state } = useLocation();
    const { color } = state;
    const gameBoardCanvas = useRef();
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

    function navigateHome() {
        navigate("/")
    }

    /**
     * updates player movement values and sends coordinates to game state on server
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

        // uses gameboard width and height to ensure player stays within gameboard bounds
        let changeInX = Math.max(0, Math.min(gameBoardCanvas.current.width - PlayerCurrent.current.width, x));
        let changeInY = Math.max(0, Math.min(gameBoardCanvas.current.height - PlayerCurrent.current.height, y));
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
        socketRef.current.emit("update-position", movementData)
    }

    /**
     * listens for keydown events and modifies player's directional movement state
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
        updatePlayerMovement(PlayerCurrent.current.x, PlayerCurrent.current.y);
    });
    
    /**
     * listens for keyup events and resets player's directional movement state
     */
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
     * Updates client's immediate gameboard canvas display
     */
    function updateClientDisplay() {
        ctx.current.clearRect(0, 0, gameBoardCanvas.current.width, gameBoardCanvas.current.height);
        // Draw the client player
        ctx.current.fillStyle = PlayerCurrent.current.playerColor;
        ctx.current.fillRect(PlayerCurrent.current.x, PlayerCurrent.current.y, PlayerCurrent.current.width, PlayerCurrent.current.height);
        // Draw the other players
        Object.values(OtherPlayers.current).forEach((player) => {
            ctx.current.fillStyle = player.playerColor;
            ctx.current.fillRect(player.x, player.y, player.width, player.height);
        });
    }


    /**
     * |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
     * On Component Mount
     * |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
     */
    useEffect(() => {
        /**
         *  create player object
         *  Player (
         *      username, x, y, speed, width, height, playerColor
         *  )
         */ 
        let playerColor = color;
        PlayerCurrent.current = new Player(
            username,
            -1,
            -1, 
            1, 
            10, 
            10, 
            playerColor
        )
        const initialPlayerInfo = {
            username: username,
            color: playerColor
        }
        socketRef.current.emit("join-game", initialPlayerInfo);

        const board = document.getElementById("gameboard");
        ctx.current = board.getContext("2d");
        const boardDimensions = board.getBoundingClientRect();
        gameBoardX.current = boardDimensions.x;
        gameBoardY.current = boardDimensions.y;
        gameBoardCanvas.current = board;

        /**
         * update the gameboard canvas with new coordinates for the current player
         */
        socketRef.current.on("update-client-position", newCoordinate => {
            PlayerCurrent.current.x = newCoordinate.x;
            PlayerCurrent.current.y = newCoordinate.y;
            updateClientDisplay()
        });

        /**
         * add new player to the current client's game state
         */
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
            updateClientDisplay()
        });

        /**
         * When current player joins a non-empty game environment...
         * receive all other player data, otherPlayers = [socketID, username, x, y, color]
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
            updateClientDisplay()
        });

        /**
         * receive an update on another player's position.
         * playerUpdates : { id, x, y }
         */
        socketRef.current.on("update-other-player-position", playerUpdates => {
            if (playerUpdates.id in OtherPlayers.current) {
                OtherPlayers.current[playerUpdates.id].x = playerUpdates.x
                OtherPlayers.current[playerUpdates.id].y = playerUpdates.y
                updateClientDisplay()
            }
        });

        /**
         * receive notification for a disconnecting player,
         */
        socketRef.current.on("player-disconnected", id => {
            delete OtherPlayers.current[id];
            updateClientDisplay()
        });

        /**
         * clean up function after component is unmounted
         */
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            socketRef.current.disconnect();
        };
        // eslint-disable-next-line
    }, []);
    return (
        <>
            <div id="GameEnvironment">
                <p id="greeting-text">Hello {username}!</p>
                <canvas id="gameboard"></canvas>
                <button onClick={() => navigateHome()}>back</button>
            </div>
        </>
    )
}

export default GameEnv;