"use client";

import dynamic from "next/dynamic";
import UIOverlay from "@/components/UIOverlay";
import ToastContainer from "@/components/ToastContainer";
import RoomHeader from "@/components/RoomHeader";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <GameCanvas />
      <RoomHeader />
      <UIOverlay />
      <ToastContainer />
    </main>
  );
}
