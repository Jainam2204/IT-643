import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
};

export function initSocket(userId) {
  if (socket && socket.connected) {
    if (userId) socket.emit("join", userId);
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: true,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    if (userId) {
      socket.emit("join", userId);
    }
  });

  socket.on("connect_error", (err) => {
    console.error(
      "Socket connect_error:",
      err && err.message ? err.message : err
    );
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
}


export function getSocketInstance() {
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
