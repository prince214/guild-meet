"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function RoomHeader() {
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();

    const onUpdate = (players: unknown[]) => {
      setPlayerCount(players.length);
    };

    socket.on("players-update", onUpdate);

    return () => {
      socket.off("players-update", onUpdate);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 pointer-events-none">
      {/* Spacer */}
      <div />

      {/* Room title */}
      <div className="rounded-xl bg-black/30 px-4 py-1.5 backdrop-blur-sm">
        <span className="text-sm font-medium text-white/70">Guild Hall</span>
      </div>

      {/* Player count */}
      <div className="rounded-xl bg-black/30 px-3 py-1.5 backdrop-blur-sm flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="text-sm text-white/60">{playerCount}</span>
      </div>
    </div>
  );
}
