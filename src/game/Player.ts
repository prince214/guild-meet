import * as Phaser from "phaser";

const AVATAR_RADIUS = 18;
const SELF_COLOR = 0xf0c040;
const OTHER_COLOR = 0xa07050;
const GLOW_COLOR = 0x4488ff;
const SPEAK_COLOR = 0x44ff88;
const SPEAK_RING_RADIUS = 28;
const LABEL_PADDING_X = 8;
const LABEL_PADDING_Y = 4;

export class Player {
  private circle: Phaser.GameObjects.Arc;
  private nameLabel: Phaser.GameObjects.Text;
  private nameBg: Phaser.GameObjects.Rectangle;
  private selfGlow: Phaser.GameObjects.Arc | null = null;
  private speakRing: Phaser.GameObjects.Arc | null = null;
  private speakTween: Phaser.Tweens.Tween | null = null;
  private _isSpeaking = false;

  constructor(
    private scene: Phaser.Scene,
    public readonly id: string,
    public readonly name: string,
    x: number,
    y: number,
    public readonly isSelf: boolean
  ) {
    const color = isSelf ? SELF_COLOR : OTHER_COLOR;

    if (isSelf) {
      this.selfGlow = scene.add.circle(x, y, AVATAR_RADIUS + 10, GLOW_COLOR, 0.15);
      this.selfGlow.setDepth(9);
    }

    this.speakRing = scene.add.circle(x, y, SPEAK_RING_RADIUS);
    this.speakRing.setStrokeStyle(3, SPEAK_COLOR, 1);
    this.speakRing.setFillStyle(0x000000, 0);
    this.speakRing.setDepth(9);
    this.speakRing.setVisible(false);

    this.circle = scene.add.circle(x, y, AVATAR_RADIUS, color);
    this.circle.setStrokeStyle(2, 0x000000, 0.3);
    this.circle.setDepth(10);

    if (isSelf) {
      scene.physics.add.existing(this.circle);
      const body = this.circle.body as Phaser.Physics.Arcade.Body;
      body.setCircle(AVATAR_RADIUS);
      body.setCollideWorldBounds(true);
    }

    this.nameLabel = scene.add.text(x, y - AVATAR_RADIUS - 16, name, {
      fontSize: "13px",
      fontFamily: "sans-serif",
      color: "#ffffff",
      align: "center",
    });
    this.nameLabel.setOrigin(0.5, 0.5);
    this.nameLabel.setDepth(12);

    const lblW = this.nameLabel.width + LABEL_PADDING_X * 2;
    const lblH = this.nameLabel.height + LABEL_PADDING_Y * 2;
    this.nameBg = scene.add.rectangle(
      x,
      y - AVATAR_RADIUS - 16,
      lblW,
      lblH,
      0x000000,
      0.5
    );
    this.nameBg.setOrigin(0.5, 0.5);
    this.nameBg.setDepth(11);
  }

  get x(): number {
    return this.circle.x;
  }

  get y(): number {
    return this.circle.y;
  }

  get body(): Phaser.Physics.Arcade.Body | null {
    return this.circle.body as Phaser.Physics.Arcade.Body | null;
  }

  get gameObject(): Phaser.GameObjects.Arc {
    return this.circle;
  }

  setPosition(x: number, y: number): void {
    this.circle.setPosition(x, y);
    this.updateLabelPosition();
  }

  lerpTo(x: number, y: number, t: number = 0.2): void {
    const newX = Phaser.Math.Linear(this.circle.x, x, t);
    const newY = Phaser.Math.Linear(this.circle.y, y, t);
    this.setPosition(newX, newY);
  }

  updateLabelPosition(): void {
    const lx = this.circle.x;
    const ly = this.circle.y - AVATAR_RADIUS - 16;
    this.nameLabel.setPosition(lx, ly);
    this.nameBg.setPosition(lx, ly);
    this.selfGlow?.setPosition(this.circle.x, this.circle.y);
    this.speakRing?.setPosition(this.circle.x, this.circle.y);
  }

  setSpeaking(speaking: boolean): void {
    if (speaking === this._isSpeaking) return;
    this._isSpeaking = speaking;

    if (!this.speakRing) return;

    if (speaking) {
      this.speakRing.setVisible(true);
      this.speakTween?.destroy();
      this.speakTween = this.scene.tweens.add({
        targets: this.speakRing,
        alpha: { from: 1, to: 0.3 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      this.speakTween?.destroy();
      this.speakTween = null;
      this.speakRing.setVisible(false);
      this.speakRing.setAlpha(1);
    }
  }

  destroy(): void {
    this.speakTween?.destroy();
    this.circle.destroy();
    this.nameLabel.destroy();
    this.nameBg.destroy();
    this.selfGlow?.destroy();
    this.speakRing?.destroy();
  }
}
