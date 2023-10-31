import React, { useState, useEffect } from 'react';
import './GameEnv.css';
import GridItem from './GridItem';

export default function App() {
  const [test, setTest] = useState(Array(5000).fill(false));
  const [redSquarePosition, setRedSquarePosition] = useState({ x: 0, y: 0 });
  console.log("rerendering app");

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { x, y } = redSquarePosition;

      switch (e.key) {
        case 'w':
          setRedSquarePosition({ x, y: y - 1 });
          break;
        case 'a':
          setRedSquarePosition({ x: x - 1, y });
          break;
        case 's':
          setRedSquarePosition({ x, y: y + 1 });
          break;
        case 'd':
          setRedSquarePosition({ x: x + 1, y });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [redSquarePosition]);

  useEffect(() => {
    const updatedArr = [...test];

    if (
      redSquarePosition.x >= 0 &&
      redSquarePosition.x < 100 &&
      redSquarePosition.y >= 0 &&
      redSquarePosition.y < 50
    ) {
      const index = redSquarePosition.y * 100 + redSquarePosition.x;
      updatedArr[index] = 'red';
    }

    setTest(updatedArr);
  }, [redSquarePosition]);

  return (
    <div className="App">
      <div id="GameEnvironment">
        <div id="gameboard">
          {test.map((cell, index) => (
            <GridItem key={index} color={cell ? cell : 'white'} />
          ))}
        </div>
      </div>
    </div>
  );
}
