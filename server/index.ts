import { createServer } from "http";
import { Server } from "socket.io";

interface PlayerData {
  id: string;
  name: string;
  x: number;
  y: number;
}

const PORT = 3001;
const players = new Map<string, PlayerData>();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on("join", (data: { name: string; viewWidth: number; viewHeight: number }) => {
    const cx = data.viewWidth / 2;
    const cy = data.viewHeight / 2;
    const player: PlayerData = {
      id: socket.id,
      name: data.name,
      x: cx + Math.random() * 200 - 100,
      y: cy + Math.random() * 100 - 50,
    };

    players.set(socket.id, player);
    socket.emit("joined", player);
    io.emit("players-update", Array.from(players.values()));
    io.emit("player-joined", { name: player.name });
    console.log(`Player joined: ${player.name} (${socket.id})`);
  });

  socket.on("move", (data: { x: number; y: number }) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      io.emit("players-update", Array.from(players.values()));
    }
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (player) {
      io.emit("player-left", { name: player.name });
    }
    players.delete(socket.id);
    io.emit("players-update", Array.from(players.values()));
    console.log(`Player disconnected: ${player?.name ?? socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
