import React, { useEffect, useState } from 'react'
import GridItem from "./GridItem";

const Grid = ({ playersData}) => {
    console.log("------------------------- GRID IS BEING RENDERED -------------------------")

    const [gridState, setGridState] = useState(Array(5000).fill(false));

    function calculateIndex(x, y) {
        return y * 100 + x;
    }

    useEffect(() => {
        console.log("------------------------- USEEFFECT IN GRID -------------------------")
        const updatedGridState = [...gridState];

        const currentPlayer = playersData.current;
        if (currentPlayer) {
            updatedGridState[calculateIndex(currentPlayer.x, currentPlayer.y)] = (
                <GridItem color={currentPlayer.color}/>
            );
        }
        if (playersData.other) {
            playersData.other.forEach((otherPlayer) => {
                updatedGridState[calculateIndex(otherPlayer.x, otherPlayer.y)] = (
                    <GridItem color={otherPlayer.color} />
                );
            });
        }

        setGridState(updatedGridState);
        
    }, [playersData]);

    return (
        <>
            {gridState.map((cell, index) => (
                <GridItem key={index} color={cell ? cell.props.color : "white"}/>
            ))}
        </>
    )
}

export default Grid