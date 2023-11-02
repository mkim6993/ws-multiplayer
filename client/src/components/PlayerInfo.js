import React from 'react'
import { useNavigate } from "react-router-dom";
import "./PlayerInfo.css";

const PlayerInfo = () => {
    const navigate = useNavigate()

    const handlePlayerInfo = async(event) => {
        event.preventDefault();
        const username = event.target[0].value;

        // check for valid input
        if (username.trim() === "" || /[^a-zA-Z0-9_]/.test(username)) {
            // invalid
            alert("Invalid Username (only alphanumeric characters)");
        } else {
            try {
                const response = await fetch('http://192.168.4.126:8000/playerInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                });
    
                if (response.status === 200) {
                    navigate(`/play/${ username }`)
                } else {
                    // handle invalid status return
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <>
            <div id="player-info-container">
                <div class="content">
                    <div class="content__container">
                        <p class="content__container__text">
                        Hello
                        </p>
                        <ul class="content__container__list">
                            <li class="content__container__list__item">Explorer!</li>
                            <li class="content__container__list__item">Engineer!</li>
                            <li class="content__container__list__item">Developer!</li>
                            <li class="content__container__list__item">Everybody!</li>
                        </ul>
                    </div>
                </div>
                <div id="form-container">
                    <form onSubmit={handlePlayerInfo}>
                        <label>
                            Username: <input name="username" autocomplete="off" />
                        </label>
                        <button type="submit">Play</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default PlayerInfo