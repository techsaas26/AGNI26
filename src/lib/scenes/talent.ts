import { sfx } from "@/lib/audio";
import { byId, listeners, store, type SceneController } from "./types";

type Dir = { x: number; y: number };
type Key = "U" | "D" | "L" | "R" | "S" | "A";

const KEYS: Record<string, Key> = {
  ArrowUp: "U",
  ArrowDown: "D",
  ArrowLeft: "L",
  ArrowRight: "R",
  w: "U",
  s: "D",
  a: "L",
  d: "R",
  W: "U",
  S: "D",
  A: "L",
  D: "R",
  Enter: "S",
  " ": "S",
};

/** Talent of AGNI — a tiny snake game on the CRT. */
export function setupTalent(): SceneController | null {
  const cv = byId<HTMLCanvasElement>("crt");
  const pad = byId("pad");
  const wrap = byId("crt-wrap");
  if (!cv || !wrap) return null;

  const x = cv.getContext("2d")!;
  const COLS = 24;
  const ROWS = 18;
  const C = 20;

  let state: "title" | "play" | "over" = "title";
  let snake: Dir[] = [];
  let dir: Dir = { x: 1, y: 0 };
  let nd: Dir = dir;
  let food: Dir = { x: 0, y: 0 };
  let score = 0;
  let hi = +store.get("agni-hi", "0");
  let acc = 0;
  let speed = 8;
  let t = 0;
  let shake = 0;
  let active = false;

  // The pixel font is hashed by next/font, so read the family from the theme variable.
  const family =
    getComputedStyle(document.body).getPropertyValue("--font-pixel").trim() || '"Press Start 2P", monospace';
  document.fonts?.load(`16px ${family}`).catch(() => {});
  const F = (px: number) => `${px}px ${family}`;

  const place = () => {
    do {
      food = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
    } while (snake.some((s) => s.x === food.x && s.y === food.y));
  };
  const reset = () => {
    snake = [
      { x: 12, y: 9 },
      { x: 11, y: 9 },
      { x: 10, y: 9 },
    ];
    dir = { x: 1, y: 0 };
    nd = dir;
    score = 0;
    speed = 8;
    acc = 0;
    place();
  };
  reset();
  const start = () => {
    reset();
    state = "play";
    sfx.coin();
  };
  const turn = (k: Key) => {
    if (k === "S" || k === "A") {
      if (state !== "play") start();
      return;
    }
    if (state !== "play") {
      start();
      return;
    }
    const m = { U: { x: 0, y: -1 }, D: { x: 0, y: 1 }, L: { x: -1, y: 0 }, R: { x: 1, y: 0 } }[k];
    if (!m || (m.x === -dir.x && m.y === -dir.y)) return;
    nd = m;
    sfx.bleep(520);
  };

  const l = listeners();
  if (pad) {
    l.on(pad, "pointerdown", (e) => {
      const b = (e.target as Element).closest("button");
      if (!b) return;
      e.preventDefault();
      turn(b.dataset.k as Key);
    });
  }
  l.on(window, "keydown", (e) => {
    if (!active) return;
    const ev = e as KeyboardEvent;
    const k = KEYS[ev.key];
    if (!k) return;
    if (state === "play" || k === "S") {
      ev.preventDefault();
      turn(k);
    }
  });
  // swipe on the glass
  let sx = 0;
  let sy = 0;
  l.on(wrap, "pointerdown", (e) => {
    const ev = e as PointerEvent;
    sx = ev.clientX;
    sy = ev.clientY;
    if (state !== "play") start();
  });
  l.on(wrap, "pointerup", (e) => {
    const ev = e as PointerEvent;
    const dx = ev.clientX - sx;
    const dy = ev.clientY - sy;
    if (Math.hypot(dx, dy) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : dy > 0 ? "D" : "U");
  });

  const px = (cx: number, cy: number, col: string) => {
    x.fillStyle = col;
    x.fillRect(cx * C + 1, cy * C + 1, C - 2, C - 2);
  };
  const star = (cx: number, cy: number, tt: number) => {
    const a = 0.7 + 0.3 * Math.sin(tt * 9);
    const X = cx * C;
    const Y = cy * C;
    x.fillStyle = `rgba(255,240,180,${a})`;
    x.fillRect(X + 8, Y + 3, 4, 14);
    x.fillRect(X + 3, Y + 8, 14, 4);
    x.fillRect(X + 6, Y + 6, 8, 8);
  };
  const centerText = (s: string, y: number, size: number, col: string) => {
    x.font = F(size);
    x.textAlign = "center";
    x.fillStyle = col;
    x.fillText(s, 240, y);
  };

  function step() {
    const h = { x: snake[0].x + nd.x, y: snake[0].y + nd.y };
    dir = nd;
    if (h.x < 0 || h.y < 0 || h.x >= COLS || h.y >= ROWS || snake.some((s) => s.x === h.x && s.y === h.y)) {
      state = "over";
      shake = 0.35;
      sfx.over();
      if (score > hi) {
        hi = score;
        store.set("agni-hi", String(hi));
      }
      return;
    }
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) {
      score++;
      speed = Math.min(16, 8 + score * 0.5);
      sfx.bleep(880 + score * 30);
      place();
    } else snake.pop();
  }

  function draw() {
    x.save();
    if (shake > 0) x.translate((Math.random() - 0.5) * 8 * shake * 3, (Math.random() - 0.5) * 8 * shake * 3);
    x.fillStyle = "#0a0602";
    x.fillRect(0, 0, 480, 360);
    x.fillStyle = "rgba(255,170,60,.05)";
    for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) x.fillRect(i * C + 9, j * C + 9, 2, 2);
    if (state === "title") {
      x.shadowColor = "#ff8a1a";
      x.shadowBlur = 14;
      centerText("AGNI’26", 130, 38, "#ffb347");
      x.shadowBlur = 6;
      centerText("TALENT SHOW", 168, 13, "#ffd9a0");
      if (Math.floor(t * 2) % 2 === 0) centerText("PRESS START", 236, 13, "#fff0c0");
      centerText("HI " + String(hi).padStart(3, "0"), 300, 10, "#c88a30");
      x.shadowBlur = 0;
    } else {
      x.strokeStyle = "rgba(255,170,60,.35)";
      x.lineWidth = 2;
      x.strokeRect(1, 1, 478, 358);
      snake.forEach((s, i) => {
        const k = i / Math.max(1, snake.length - 1);
        px(s.x, s.y, i === 0 ? "#fff0c0" : `rgb(255,${Math.round(190 - k * 70)},${Math.round(70 - k * 40)})`);
      });
      star(food.x, food.y, t);
      x.shadowColor = "#ff8a1a";
      x.shadowBlur = 8;
      x.font = F(10);
      x.textAlign = "left";
      x.fillStyle = "#ffb347";
      x.fillText("TALENTS " + String(score).padStart(2, "0"), 10, 20);
      x.textAlign = "right";
      x.fillText("HI " + String(Math.max(hi, score)).padStart(2, "0"), 470, 20);
      x.shadowBlur = 0;
      if (state === "over") {
        x.fillStyle = "rgba(8,3,0,.74)";
        x.fillRect(0, 0, 480, 360);
        x.shadowColor = "#ff8a1a";
        x.shadowBlur = 12;
        centerText("GAME OVER", 150, 26, "#ffb347");
        centerText("TALENT UNLOCKED: " + score, 194, 11, "#ffd9a0");
        if (Math.floor(t * 2) % 2 === 0) centerText("PRESS START", 262, 12, "#fff0c0");
        x.shadowBlur = 0;
      }
    }
    x.restore();
  }

  return {
    tick(dt, time) {
      t = time;
      active = true;
      shake = Math.max(0, shake - dt);
      if (state === "play") {
        acc += dt;
        const iv = 1 / speed;
        while (acc >= iv) {
          acc -= iv;
          step();
          if (state !== "play") break;
        }
      }
      draw();
    },
    leave() {
      active = false;
    },
    destroy() {
      l.clear();
    },
  };
}
