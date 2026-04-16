
You are continuing development of **GuildMeet**, a multiplayer 2D virtual workspace built with Next.js, Phaser, and Socket.io.

Phase 1 is complete:

* Multiplayer movement works
* Players can see each other
* Basic tavern layout exists

Now implement **Phase 2**, which focuses on:

1. Voice communication
2. Player presence improvements
3. UI polish
4. Better tavern immersion

---

# 🎯 PHASE 2 GOALS

* Add real-time voice chat (like a meeting)
* Show who is speaking
* Improve player identity and visuals
* Improve tavern feel
* Keep everything simple and performant

---

# 🔊 1. VOICE CHAT (IMPORTANT)

Use:

* LiveKit (preferred)

---

## Requirements:

### On join:

* User connects to a voice room
* Mic is ON by default (can toggle)

### Features:

* Everyone can hear everyone (no proximity yet)
* Toggle mic button (mute/unmute)
* Show speaking indicator when user is talking

---

## Speaking Indicator:

When user speaks:

* Show glow ring around avatar OR
* Animate name tag OR
* Add small "🔊" icon above player

Use audio level detection:

* Detect volume > threshold → "speaking = true"

---

# 🧑 PLAYER IMPROVEMENTS

### 1. Highlight Current Player

* Add soft glowing circle under current player
* Use different color (blue or green)
* Make it subtle and clean

---

### 2. Player Names

* Improve name styling:

  * Rounded background
  * Slight opacity
  * Better font

Example:

* Dark semi-transparent label
* White text

---

### 3. Player Join/Leave Feedback

* When player joins:

  * Show small toast: "Player123 joined the guild"

* When player leaves:

  * Show: "Player123 left"

---

# 🏰 TAVERN VISUAL UPGRADE

Improve the room:

### Add:

* Better wooden floor texture (tile-based)
* Proper round tables (sprite or improved drawing)
* Chairs around tables
* Slight shadows under objects

---

### Depth Sorting:

Ensure:

* Players appear above floor
* Tables/chairs render correctly with depth

---

# 🧩 UI OVERLAY IMPROVEMENTS

Upgrade bottom bar:

### Mic Button:

* Toggle state (muted/unmuted)
* Change color:

  * Green = active
  * Red = muted

---

### Add:

* Player count (top corner)
* Room title: "Guild Hall"

---

### Polish:

* Smooth hover effects
* Slight animations (scale on hover)

---

# ⚙️ PERFORMANCE

* Do NOT re-render React on every movement
* Keep Phaser handling rendering
* Use refs for audio + game state

---

# 🚀 MVP RESULT

At the end of Phase 2:

1. User joins room
2. Sees avatars moving
3. Can talk to others (voice works)
4. Can mute/unmute mic
5. Sees who is speaking
6. UI feels polished

---

# ⚠️ IMPORTANT

* Do NOT over-engineer
* Clean modular code

---

Now implement:

1. Voice system (LiveKit)
2. Speaking detection
3. Player highlighting
4. UI improvements
5. Tavern visual polish
