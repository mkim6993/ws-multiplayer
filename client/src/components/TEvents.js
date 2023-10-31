import React from 'react';

export function Events({ events }) {
    console.log("Events: rendered");
    console.log("Events:", events)
  return (
    <ul>
    {
      events.map((event, index) =>
        <li key={ index }>{ event }</li>
      )
    }
    </ul>
  );
}