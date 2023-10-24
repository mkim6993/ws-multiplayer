import React from 'react'
import "./GridItem.css";

const GridItem = ({color}) => {
    return (
        <div className="gridBox" style={{ backgroundColor: color }}></div>
    )
}

export default GridItem