import { io } from "socket.io-client";

// Get socket URL from Vite environment variables, fallback to localhost if not set
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});
