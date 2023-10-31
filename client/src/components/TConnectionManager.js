import React from 'react';
import { socket } from '../socket';

export function ConnectionManager() {
    console.log("Connection Manager: rendered")
  function connect() {
    console.log("CM: socket connect");
    socket.connect();
  }

  function disconnect() {
    console.log("CM: socket disconnect");
    socket.disconnect();
  }

  return (
    <>
      <button onClick={ connect }>Connect</button>
      <button onClick={ disconnect }>Disconnect</button>
    </>
  );
}