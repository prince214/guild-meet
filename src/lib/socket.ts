import { io, Socket } from "socket.io-client";

/** Must be NEXT_PUBLIC_* so the browser bundle receives it; plain env vars are server-only. */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined);

declare global {
  var __guildmeet_socket: Socket | undefined;
}

export function getSocket(): Socket {
  if (!globalThis.__guildmeet_socket) {
    if (!SOCKET_URL) {
      throw new Error(
        "NEXT_PUBLIC_SOCKET_URL is not set (required in production builds)",
      );
    }
    globalThis.__guildmeet_socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }
  return globalThis.__guildmeet_socket;
}
