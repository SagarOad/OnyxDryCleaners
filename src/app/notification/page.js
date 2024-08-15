"use client"

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function HomePage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Connect to the socket server
    socket = io("http://localhost:3000");

    // Listen for new data notifications
    socket.on("newData", (data) => {
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Real-time Notifications</h1>
      <ul>
        {notifications.map((item, index) => (
          <li key={index}>
            {item.title}: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
