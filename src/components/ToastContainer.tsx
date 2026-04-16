"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";

interface Toast {
  id: number;
  message: string;
  leaving: boolean;
}

let nextId = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, leaving: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const onJoined = (data: { name: string }) => {
      addToast(`${data.name} joined the guild`);
    };
    const onLeft = (data: { name: string }) => {
      addToast(`${data.name} left`);
    };

    socket.on("player-joined", onJoined);
    socket.on("player-left", onLeft);

    return () => {
      socket.off("player-joined", onJoined);
      socket.off("player-left", onLeft);
    };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg bg-black/50 px-4 py-2 text-sm text-white/90 backdrop-blur-sm ${
            toast.leaving ? "animate-toast-out" : "animate-toast-in"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
