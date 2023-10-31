import React from 'react';

export function ConnectionState({ isConnected }) {
    console.log("ConnectionState: rendered");
    console.log("ConnectionState:", isConnected);
  return <p>State: { '' + isConnected }</p>;
}