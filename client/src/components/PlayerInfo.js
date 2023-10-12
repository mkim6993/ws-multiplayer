import React from 'react'
import { useNavigate } from "react-router-dom";

const PlayerInfo = () => {
    const navigate = useNavigate()
    const handlePlayerInfo = async(event) => {
        event.preventDefault();
        const username = event.target[0].value;

        // check for valid input

        try {
            const response = await fetch('http://localhost:8000/playerInfo', {
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

    return (
        <>
            <div>PlayerInfo</div>
            <form onSubmit={handlePlayerInfo}>
                <label>
                    Username: <input name="username" />
                </label>
                <button type="submit">Play</button>
            </form>
        </>
    )
}

export default PlayerInfo