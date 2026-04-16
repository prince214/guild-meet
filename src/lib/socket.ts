import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

declare global {
  var __guildmeet_socket: Socket | undefined;
}

export function getSocket(): Socket {
  if (!globalThis.__guildmeet_socket) {
    globalThis.__guildmeet_socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return globalThis.__guildmeet_socket;
}
