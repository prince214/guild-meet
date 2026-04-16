import * as Phaser from "phaser";
import { Player } from "./Player";
import { getSocket } from "@/lib/socket";
import { getVoiceManager } from "@/lib/voice";
import type { Socket } from "socket.io-client";

interface PlayerData {
  id: string;
  name: string;
  x: number;
  y: number;
}

const WALL_THICKNESS = 20;
const PLAYER_SPEED = 200;
const MOVE_EMIT_INTERVAL = 66; // ~15 updates/sec

export class TavernScene extends Phaser.Scene {
  private socket!: Socket;
  private selfPlayer: Player | null = null;
  private otherPlayers = new Map<string, Player>();
  private selfId: string | null = null;
  private selfName: string | null = null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private lastMoveEmit = 0;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private furniture!: Phaser.Physics.Arcade.StaticGroup;
  private roomWidth = 0;
  private roomHeight = 0;

  constructor() {
    super({ key: "TavernScene" });
  }

  create(): void {
    this.roomWidth = this.scale.width;
    this.roomHeight = this.scale.height;

    this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);

    this.drawRoom();
    this.setupInput();
    this.setupSocket();

    this.scale.on("resize", this.handleResize, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
  }

  private drawRoom(): void {
    const W = this.roomWidth;
    const H = this.roomHeight;

    // Floor at depth 0
    const floor = this.add.graphics();
    floor.setDepth(0);

    // Alternating plank colors
    const plankColors = [0x5c3a1e, 0x573618];
    for (let y = 0; y < H; y += 40) {
      const colorIdx = Math.floor(y / 40) % 2;
      floor.fillStyle(plankColors[colorIdx]);
      floor.fillRect(0, y, W, 40);
    }

    // Plank seams
    floor.lineStyle(1, 0x4a2f15, 0.3);
    for (let y = 0; y < H; y += 40) {
      floor.lineBetween(0, y, W, y);
    }
    for (let x = 0; x < W; x += 80) {
      const offset = (Math.floor(x / 80) % 2) * 20;
      for (let y = offset; y < H; y += 80) {
        floor.lineBetween(x, y, x, y + 40);
      }
    }

    // Wood grain dots for texture
    floor.fillStyle(0x4a2f15, 0.15);
    for (let i = 0; i < 200; i++) {
      const gx = Math.random() * W;
      const gy = Math.random() * H;
      floor.fillCircle(gx, gy, 1 + Math.random() * 1.5);
    }

    // Walls (visual) at depth 1
    const wallGfx = this.add.graphics();
    wallGfx.setDepth(1);
    wallGfx.fillStyle(0x2a1a0a);
    wallGfx.fillRect(0, 0, W, WALL_THICKNESS);
    wallGfx.fillRect(0, H - WALL_THICKNESS, W, WALL_THICKNESS);
    wallGfx.fillRect(0, 0, WALL_THICKNESS, H);
    wallGfx.fillRect(W - WALL_THICKNESS, 0, WALL_THICKNESS, H);

    // Wall trim
    wallGfx.lineStyle(2, 0x6b4226, 0.6);
    wallGfx.strokeRect(WALL_THICKNESS, WALL_THICKNESS, W - WALL_THICKNESS * 2, H - WALL_THICKNESS * 2);

    // Wall collision bodies
    this.walls = this.physics.add.staticGroup();
    this.createWallBody(W / 2, WALL_THICKNESS / 2, W, WALL_THICKNESS);
    this.createWallBody(W / 2, H - WALL_THICKNESS / 2, W, WALL_THICKNESS);
    this.createWallBody(WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H);
    this.createWallBody(W - WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H);

    // Furniture collision group
    this.furniture = this.physics.add.staticGroup();

    this.drawBar(wallGfx);
    this.drawTables();
  }

  private createWallBody(x: number, y: number, w: number, h: number): void {
    const zone = this.add.zone(x, y, w, h);
    this.physics.add.existing(zone, true);
    this.walls.add(zone);
  }

  private drawBar(g: Phaser.GameObjects.Graphics): void {
    const H = this.roomHeight;
    const barX = 50;
    const barY = H * 0.15;
    const barW = 50;
    const barH = H * 0.7;

    // Bar counter
    g.fillStyle(0x3a1f0d);
    g.fillRect(barX, barY, barW, barH);
    g.lineStyle(2, 0x6b4226, 0.8);
    g.strokeRect(barX, barY, barW, barH);

    // Bar top surface highlight
    g.fillStyle(0x4a2c17);
    g.fillRect(barX + 5, barY + 5, barW - 10, barH - 10);

    // Bar collision body
    const barZone = this.add.zone(barX + barW / 2, barY + barH / 2, barW, barH);
    this.physics.add.existing(barZone, true);
    this.furniture.add(barZone);

    // Bartender
    g.fillStyle(0xcc8844);
    g.fillCircle(barX - 5, barY + barH / 2, 14);
    g.fillStyle(0xffd700);
    g.fillCircle(barX - 5, barY + barH / 2 - 10, 6);

    // Bar stools
    const stoolX = barX + barW + 20;
    const stoolCount = 7;
    const stoolSpacing = barH / (stoolCount + 1);
    for (let i = 1; i <= stoolCount; i++) {
      const sy = barY + stoolSpacing * i;
      g.fillStyle(0x5a3520);
      g.fillCircle(stoolX, sy, 10);
      g.lineStyle(1, 0x3a1f0d, 0.6);
      g.strokeCircle(stoolX, sy, 10);
    }
  }

  private drawTables(): void {
    const W = this.roomWidth;
    const H = this.roomHeight;
    const tableRadius = 50;
    const chairRadius = 10;

    const areaLeft = 160;
    const areaRight = W - 40;
    const areaWidth = areaRight - areaLeft;
    const areaTop = 60;
    const areaBottom = H - 60;
    const areaHeight = areaBottom - areaTop;

    const tables: { x: number; y: number }[] = [
      { x: areaLeft + areaWidth * 0.25, y: areaTop + areaHeight * 0.2 },
      { x: areaLeft + areaWidth * 0.75, y: areaTop + areaHeight * 0.2 },
      { x: areaLeft + areaWidth * 0.5, y: areaTop + areaHeight * 0.5 },
      { x: areaLeft + areaWidth * 0.25, y: areaTop + areaHeight * 0.8 },
      { x: areaLeft + areaWidth * 0.75, y: areaTop + areaHeight * 0.8 },
    ];

    // Shadow layer at depth 4
    const shadowGfx = this.add.graphics();
    shadowGfx.setDepth(4);

    // Furniture layer at depth 5
    const furnGfx = this.add.graphics();
    furnGfx.setDepth(5);

    for (const table of tables) {
      // Shadow (larger offset, softer)
      shadowGfx.fillStyle(0x1a0e05, 0.25);
      shadowGfx.fillCircle(table.x + 5, table.y + 5, tableRadius + 4);

      // Table surface
      furnGfx.fillStyle(0x4a2c17);
      furnGfx.fillCircle(table.x, table.y, tableRadius);
      furnGfx.lineStyle(2, 0x3a1f0d, 0.8);
      furnGfx.strokeCircle(table.x, table.y, tableRadius);

      // Inner ring detail
      furnGfx.lineStyle(1, 0x5a3a22, 0.4);
      furnGfx.strokeCircle(table.x, table.y, tableRadius - 12);

      // Table collision body
      const tableZone = this.add.zone(table.x, table.y, tableRadius * 2 + 10, tableRadius * 2 + 10);
      this.physics.add.existing(tableZone, true);
      this.furniture.add(tableZone);

      // Chairs around table
      const chairCount = 4;
      const chairDist = tableRadius + 22;
      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * Math.PI * 2 - Math.PI / 4;
        const cx = table.x + Math.cos(angle) * chairDist;
        const cy = table.y + Math.sin(angle) * chairDist;
        shadowGfx.fillStyle(0x1a0e05, 0.2);
        shadowGfx.fillCircle(cx + 2, cy + 2, chairRadius + 1);
        furnGfx.fillStyle(0x5a3520);
        furnGfx.fillCircle(cx, cy, chairRadius);
        furnGfx.lineStyle(1, 0x3a1f0d, 0.5);
        furnGfx.strokeCircle(cx, cy, chairRadius);
      }
    }
  }

  private setupInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupSocket(): void {
    this.socket = getSocket();
    this.socket.connect();

    const playerName = `Player${Math.floor(Math.random() * 9000 + 1000)}`;
    this.socket.emit("join", {
      name: playerName,
      viewWidth: this.roomWidth,
      viewHeight: this.roomHeight,
    });

    this.socket.on("joined", (data: PlayerData) => {
      this.selfId = data.id;
      this.selfName = data.name;
      this.selfPlayer = new Player(this, data.id, data.name, data.x, data.y, true);

      if (this.selfPlayer.gameObject) {
        this.physics.add.collider(this.selfPlayer.gameObject, this.walls);
        this.physics.add.collider(this.selfPlayer.gameObject, this.furniture);
      }

      // Connect to LiveKit voice room
      getVoiceManager().connect(data.id, data.name).catch((err) => {
        console.error("Voice connection failed:", err);
      });
    });

    this.socket.on("players-update", (players: PlayerData[]) => {
      const currentIds = new Set<string>();

      for (const p of players) {
        currentIds.add(p.id);
        if (p.id === this.selfId) continue;

        const existing = this.otherPlayers.get(p.id);
        if (existing) {
          existing.lerpTo(p.x, p.y, 0.3);
        } else {
          const newPlayer = new Player(this, p.id, p.name, p.x, p.y, false);
          this.otherPlayers.set(p.id, newPlayer);
        }
      }

      for (const [id, player] of this.otherPlayers) {
        if (!currentIds.has(id)) {
          player.destroy();
          this.otherPlayers.delete(id);
        }
      }
    });
  }

  update(time: number): void {
    if (!this.selfPlayer?.body) return;

    const body = this.selfPlayer.body;
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) vx -= PLAYER_SPEED;
    if (right) vx += PLAYER_SPEED;
    if (up) vy -= PLAYER_SPEED;
    if (down) vy += PLAYER_SPEED;

    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    body.setVelocity(vx, vy);
    this.selfPlayer.updateLabelPosition();

    if (time - this.lastMoveEmit >= MOVE_EMIT_INTERVAL && (vx !== 0 || vy !== 0)) {
      this.lastMoveEmit = time;
      this.socket.emit("move", {
        x: this.selfPlayer.x,
        y: this.selfPlayer.y,
      });
    }

    // Update speaking indicators from VoiceManager
    const speakers = getVoiceManager().speakers;
    if (this.selfPlayer && this.selfId) {
      this.selfPlayer.setSpeaking(speakers.has(this.selfId));
    }
    for (const [id, player] of this.otherPlayers) {
      player.setSpeaking(speakers.has(id));
    }
  }

  shutdown(): void {
    this.scale.off("resize", this.handleResize, this);
    getVoiceManager().disconnect();
    this.socket?.disconnect();
  }
}
