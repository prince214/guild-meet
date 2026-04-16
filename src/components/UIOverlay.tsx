"use client";

import { useState } from "react";
import { getSocket } from "@/lib/socket";
import { getVoiceManager } from "@/lib/voice";

function IconButton({
  children,
  label,
  variant = "default",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "mic-on" | "mic-off";
  className?: string;
  onClick?: () => void;
}) {
  const base =
    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer hover:scale-110 active:scale-95";

  const variantStyles: Record<string, string> = {
    default: "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    "mic-on": "bg-green-600 hover:bg-green-500 text-white",
    "mic-off": "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      className={`${base} ${variantStyles[variant]} ${className}`}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const MicOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const MicOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
    <path d="M5 10v2a7 7 0 0 0 12 5" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

export default function UIOverlay() {
  const [isMuted, setIsMuted] = useState(false);

  const handleMicToggle = async () => {
    const vm = getVoiceManager();
    await vm.toggleMic();
    setIsMuted(vm.isMuted);
  };

  const handleLeave = () => {
    getVoiceManager().disconnect();
    getSocket().disconnect();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 rounded-2xl bg-black/40 px-6 py-3 backdrop-blur-md">
      {/* Mic */}
      <IconButton
        label={isMuted ? "Unmute" : "Mute"}
        variant={isMuted ? "mic-off" : "mic-on"}
        onClick={handleMicToggle}
      >
        {isMuted ? <MicOffIcon /> : <MicOnIcon />}
      </IconButton>

      {/* Chat */}
      <IconButton label="Chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </IconButton>

      {/* Settings */}
      <IconButton label="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </IconButton>

      {/* Divider */}
      <div className="w-px h-6 bg-white/20" />

      {/* Leave */}
      <IconButton label="Leave" variant="danger" onClick={handleLeave}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
      </IconButton>
    </div>
  );
}
