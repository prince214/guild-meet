You are building an MVP for a product called **GuildMeet**.

GuildMeet is a browser-based virtual workspace where users join a 2D tavern-style room and control avatars for daily standup meetings.

The goal of Phase 1 is to build:

* A multiplayer 2D tavern room
* Avatar movement (WASD / arrow keys)
* Real-time sync of player positions
* Basic UI overlay (no voice yet)

---

## 🧱 Tech Stack

Use:

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Phaser.js (for game rendering)
* Socket.io (for real-time multiplayer)

---

## 🎮 GAME REQUIREMENTS

### Scene: Tavern Tables Layout

Create a 2D top-down tavern room with:

* Wooden floor texture
* 3–4 round tables placed around the room
* Chairs around tables
* A center open walking area
* A bar with a bartender with chairs around it

Tables should act as **social zones** (for future use)

---

### Player Avatar

Each player should have:

* Unique ID
* Name (temporary random name like "Player123")
* Position (x, y)
* Simple sprite (circle or placeholder image)

---

### Movement

* Use WASD or Arrow keys
* Smooth movement (not tile-based)
* Basic collision with walls and tables

---

### Multiplayer Sync

Use Socket.io:

* On join:

  * Create a new player
  * Broadcast to all users

* On move:

  * Emit player position
  * Server updates state
  * Broadcast updated positions

* On disconnect:

  * Remove player

---

### Player Rendering

* Render all players in the scene
* Show name label above avatar
* Highlight current player differently

---

## 🌐 SOCKET SERVER

Create a simple Node.js Socket.io server:

Maintain:

* In-memory player list

Events:

* "join"
* "move"
* "players-update"
* "disconnect"

---

## 🧩 UI OVERLAY (Tailwind)

Create a floating bottom UI bar:

Features:

* Mic button (non-functional placeholder)
* Settings button
* Chat button
* "Leave" button (red)

Style:

* Centered at bottom
* Semi-transparent dark background
* Rounded corners
* Slight blur (glassmorphism)

---

## 🧠 GAME + UI INTEGRATION

* Phaser canvas should take full screen
* UI overlay should sit above it using absolute positioning
* Ensure responsiveness

---

## ⚡ PERFORMANCE

* Use requestAnimationFrame properly
* Avoid unnecessary re-renders
* Use refs for Phaser instance

---

## 🚀 MVP DELIVERABLE

Working app where:

1. User opens site
2. Automatically joins room
3. Sees their avatar
4. Can move around
5. Sees other players moving in real-time

---

## 🎨 STYLE DIRECTION

* Warm tavern feel (brown/orange tones)
* Soft lighting feel
* Minimal UI distractions

---

## ⚠️ IMPORTANT

* Keep code modular and clean
* Use functional React components
* Avoid over-engineering
* Focus on working MVP

---

Now generate:

1. Full Next.js setup
2. Phaser scene implementation
3. Socket.io server
4. UI overlay
5. Integration between all parts
