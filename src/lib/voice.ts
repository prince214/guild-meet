import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type Participant,
} from "livekit-client";

const LIVEKIT_ROOM_NAME = "guild-hall";

declare global {
  var __guildmeet_voice: VoiceManager | undefined;
}

class VoiceManager {
  private room: Room | null = null;
  readonly speakers = new Set<string>();
  isMuted = false;
  private _connected = false;

  get connected(): boolean {
    return this._connected;
  }

  async connect(identity: string, name: string): Promise<void> {
    if (this._connected) return;

    const res = await fetch("/api/livekit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity,
        name,
        room: LIVEKIT_ROOM_NAME,
      }),
    });

    if (!res.ok) {
      console.error("Failed to fetch LiveKit token:", res.statusText);
      return;
    }

    const { token, url } = await res.json();

    this.room = new Room();

    this.room.on(
      RoomEvent.ActiveSpeakersChanged,
      (activeSpeakers: Participant[]) => {
        this.speakers.clear();
        for (const p of activeSpeakers) {
          this.speakers.add(p.identity);
        }
      }
    );

    this.room.on(
      RoomEvent.TrackSubscribed,
      (track) => {
        if (track.kind === Track.Kind.Audio) {
          const el = track.attach();
          el.id = `lk-audio-${track.sid}`;
          document.body.appendChild(el);
        }
      }
    );

    this.room.on(
      RoomEvent.TrackUnsubscribed,
      (track) => {
        track.detach().forEach((el) => el.remove());
      }
    );

    await this.room.connect(url, token);
    await this.room.localParticipant.setMicrophoneEnabled(true);
    this._connected = true;
    this.isMuted = false;
  }

  async toggleMic(): Promise<void> {
    if (!this.room) return;
    this.isMuted = !this.isMuted;
    await this.room.localParticipant.setMicrophoneEnabled(!this.isMuted);
  }

  disconnect(): void {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
    this.speakers.clear();
    this._connected = false;
    this.isMuted = false;
  }
}

export function getVoiceManager(): VoiceManager {
  if (!globalThis.__guildmeet_voice) {
    globalThis.__guildmeet_voice = new VoiceManager();
  }
  return globalThis.__guildmeet_voice;
}
