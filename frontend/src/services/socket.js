import { io } from "socket.io-client";

let socket = null;

export function getSocket(token) {
  if (socket) return socket;
  socket = io("http://localhost:3000", {
    transports: ["websocket"],
    query: { token },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try {
      socket.disconnect();
    } catch {
      console.error("Error disconnecting socket");
    }
    socket = null;
  }
}



