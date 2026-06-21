import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId: string) {
  if (socket?.connected) return socket;
  socket = io("http://localhost:5000", {
    query: { userId },
    transports: ["websocket"],
  });
  socket.on("connect", () => console.log("[Socket] Connected"));
  socket.on("disconnect", () => console.log("[Socket] Disconnected"));
  return socket;
}

export function getSocket() { return socket; }

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
