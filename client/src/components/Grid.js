import React, { useEffect, useState } from 'react'
import GridItem from "./GridItem";

const Grid = () => {
    const [gridState, setGridState] = useState(Array(5000).fill(false));

    const updateGridItem = (index, hasPlayer) => {
        setGridState((prevGridState) => {
            const newGridState = [...prevGridState];
            newGridState[index] = hasPlayer;
            return newGridState;
        });
    };

    return (
        <>
            {gridState.map((hasPlayer, index) => (
                <GridItem key={index} hasPlayer={hasPlayer} />
            ))}
        </>
    )
}

export default Grid