"use client";

/* JPE STUDIO — Live Wallpaper Renderer
   Renders animated CSS/canvas backgrounds behind the IDE shell. */
import { useEffect, useRef, memo } from "react";
import { useJpeSettings} from "./jpe-settings-context";
import { T } from "./robust/jpe-theme";

/* ── CSS keyframes injected once ── */
const STYLE_ID = "jpe-wallpaper-keyframes";
function ensureKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
@keyframes jpe-float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.12)}}
@keyframes jpe-pulse{0%,100%{opacity:.25}50%{opacity:.6}}
@keyframes jpe-grid-scroll{0%{background-position:0 0}100%{background-position:0 60px}}
@keyframes jpe-aurora-shift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes jpe-rain{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
`;
  document.head.appendChild(style);
}

/* ── PARTICLES preset ── */
function Particles({ opacity, speed }: { opacity: number; speed: number }) {
  const count = 40;
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ opacity: opacity / 100 }}>
      {Array.from({ length: count }).map((_, i) => {
        const size = 1.5 + Math.random() * 3;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const dur = (4 + Math.random() * 8) / speed;
        const delay = Math.random() * -10;
        const color = i % 3 === 0 ? T.cyan : i % 3 === 1 ? T.violet : T.emerald;
        return (
          <div key={i} className="absolute rounded-full" style={{
            width: size, height: size,
            left: `${x}%`, top: `${y}%`,
            background: color,
            boxShadow: `0 0 ${size * 3}px ${color}60`,
            animation: `jpe-float ${dur}s ease-in-out ${delay}s infinite, jpe-pulse ${dur * 0.7}s ease-in-out ${delay}s infinite`}} />
        );
      })}
    </div>
  );
}

/* ── GRID preset ── */
function CyberGrid({ opacity, speed }: { opacity: number; speed: number }) {
  const dur = 4 / speed;
  return (
    <div className="absolute inset-0" style={{ opacity: opacity / 100 }}>
      {/* perspective grid floor */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(${T.cyan}08 1px, transparent 1px),
          linear-gradient(90deg, ${T.cyan}08 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        animation: `jpe-grid-scroll ${dur}s linear infinite`}} />
      {/* horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{
        background: `linear-gradient(to top, ${T.violet}12, transparent)`}} />
      {/* top accent line */}
      <div className="absolute top-[35%] left-0 right-0 h-px" style={{
        background: `linear-gradient(90deg, transparent, ${T.cyan}20, ${T.violet}20, transparent)`}} />
    </div>
  );
}

/* ── AURORA preset ── */
function Aurora({ opacity, speed }: { opacity: number; speed: number }) {
  const dur = 12 / speed;
  return (
    <div className="absolute inset-0" style={{ opacity: opacity / 100 }}>
      <div className="absolute inset-0" style={{
        background: `linear-gradient(135deg,
          ${T.violet}18 0%, ${T.cyan}12 25%,
          ${T.emerald}10 50%, ${T.violet}15 75%,
          ${T.cyan}12 100%
        )`,
        backgroundSize: "400% 400%",
        animation: `jpe-aurora-shift ${dur}s ease infinite`}} />
      {/* floating blobs */}
      <div className="absolute rounded-full" style={{
        width: 400, height: 400,
        top: "10%", left: "15%",
        background: `radial-gradient(circle, ${T.violet}15, transparent 70%)`,
        filter: "blur(80px)",
        animation: `jpe-float ${dur * 1.5}s ease-in-out infinite`}} />
      <div className="absolute rounded-full" style={{
        width: 350, height: 350,
        bottom: "15%", right: "10%",
        background: `radial-gradient(circle, ${T.cyan}12, transparent 70%)`,
        filter: "blur(80px)",
        animation: `jpe-float ${dur * 1.2}s ease-in-out -3s infinite`}} />
    </div>
  );
}

/* ── MATRIX / DIGITAL RAIN preset (canvas) ── */
function MatrixRain({ opacity, speed }: { opacity: number; speed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const chars = "01アイウエオカキクケコサシスセソタチツテトJPESTUDIOXML{}[]<>/=";
    const fontSize = 12;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(7,8,16,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Random color between cyan and violet
        const r = Math.random();
        ctx.fillStyle = r < 0.7
          ? `rgba(99,179,237,${0.4 + Math.random() * 0.5})`
          : `rgba(139,92,246,${0.3 + Math.random() * 0.4})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed * 0.5;
      }
      animId = requestAnimationFrame(draw);
    };

    const interval = 1000 / (30 * speed);
    const timer = setInterval(() => {
      cancelAnimationFrame(animId);
      draw();
    }, interval);

    // Use rAF instead for smoothness
    clearInterval(timer);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(timer);
      window.removeEventListener("resize", resize);
    };
  }, [speed]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: opacity / 100 }} />
  );
}

/* ── CUSTOM WALLPAPER ── */
function CustomWallpaper({ opacity, url }: { opacity: number; url: string }) {
  if (!url) return null;
  return (
    <div className="absolute inset-0" style={{
      opacity: opacity / 100,
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "brightness(0.5) saturate(0.7)"}} />
  );
}

/* ── MAIN EXPORT ── */
function JpeWallpaperInner() {
  ensureKeyframes();
  const { settings } = useJpeSettings();
  const { wallpaper, wallpaperOpacity, wallpaperSpeed, customWallpaperUrl } = settings;

  if (wallpaper === "none") return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      {wallpaper === "particles" && <Particles opacity={wallpaperOpacity} speed={wallpaperSpeed} />}
      {wallpaper === "grid" && <CyberGrid opacity={wallpaperOpacity} speed={wallpaperSpeed} />}
      {wallpaper === "aurora" && <Aurora opacity={wallpaperOpacity} speed={wallpaperSpeed} />}
      {wallpaper === "matrix" && <MatrixRain opacity={wallpaperOpacity} speed={wallpaperSpeed} />}
      {wallpaper === "custom" && <CustomWallpaper opacity={wallpaperOpacity} url={customWallpaperUrl} />}
    </div>
  );
}

export const JpeWallpaper = memo(JpeWallpaperInner);
