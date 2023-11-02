import React from 'react'
import { useNavigate } from "react-router-dom";
import "./PlayerInfo.css";

const PlayerInfo = () => {
    const navigate = useNavigate()

    const handlePlayerInfo = async(event) => {
        event.preventDefault();
        console.log(event.target[1].value);
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
                    navigate(`/play/${ username }`, { state: { color: event.target[1].value }});
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
                <div className="content">
                    <div className="content__container">
                        <p className="content__container__text">
                        Hello
                        </p>
                        <ul className="content__container__list">
                            <li className="content__container__list__item">Explorer!</li>
                            <li className="content__container__list__item">Engineer!</li>
                            <li className="content__container__list__item">Developer!</li>
                            <li className="content__container__list__item">Everybody!</li>
                        </ul>
                    </div>
                </div>
                <div id="form-container">
                    <form onSubmit={handlePlayerInfo}>
                        <label>
                            Username: <input name="username" autoComplete="off" />
                        </label>
                        <label>
                            Color: <input name="color" type="color" />
                        </label>
                        <button type="submit">Play</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default PlayerInfo