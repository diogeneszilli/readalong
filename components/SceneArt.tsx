import type { WorldId } from "@/lib/schema";
import { HEROES, resolveScene } from "@/lib/scenes";

/**
 * Flat, picture-book style SVG scenes, drawn in-repo (no third-party art).
 * viewBox is 800×320; the component scales to its container width.
 */
export default function SceneArt({
  world,
  scene,
  className = "",
  showHero = true,
}: {
  world: WorldId;
  scene?: string;
  className?: string;
  showHero?: boolean;
}) {
  const id = resolveScene(world, scene);
  return (
    <svg
      viewBox="0 0 800 320"
      role="img"
      aria-label={`${world} scene: ${id}`}
      className={`block h-auto w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sky-forest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe6ff" />
          <stop offset="1" stopColor="#eaf7ff" />
        </linearGradient>
        <linearGradient id="sky-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2f6b" />
          <stop offset="1" stopColor="#f2a65a" />
        </linearGradient>
        <linearGradient id="space" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1035" />
          <stop offset="1" stopColor="#2b2d6b" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5dc8f5" />
          <stop offset="1" stopColor="#1b7fc9" />
        </linearGradient>
        <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123a6b" />
          <stop offset="1" stopColor="#061a33" />
        </linearGradient>
        <linearGradient id="jelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb6d9" />
          <stop offset="1" stopColor="#ff7ab8" />
        </linearGradient>
      </defs>
      {world === "forest" && <Forest scene={id} />}
      {world === "space" && <Space scene={id} />}
      {world === "ocean" && <Ocean scene={id} />}
      {showHero && <Hero kind={HEROES[world]} scene={id} world={world} />}
    </svg>
  );
}

/* ---------------------------------------------------------------- props */

const Sun = ({ x = 690, y = 70 }) => (
  <g>
    <circle cx={x} cy={y} r={34} fill="#ffd23f" />
    <circle cx={x} cy={y} r={46} fill="#ffd23f" opacity={0.25} />
  </g>
);

const Cloud = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity={0.9}>
    <ellipse cx={0} cy={0} rx={38} ry={16} />
    <circle cx={-14} cy={-8} r={16} />
    <circle cx={10} cy={-12} r={20} />
  </g>
);

const Tree = ({ x, y = 236, s = 1, dark = false }: { x: number; y?: number; s?: number; dark?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-9} y={-30} width={18} height={40} rx={4} fill="#8a5a2b" />
    <circle cx={0} cy={-58} r={40} fill={dark ? "#2f7a4a" : "#4caf6d"} />
    <circle cx={-26} cy={-40} r={28} fill={dark ? "#2f7a4a" : "#4caf6d"} />
    <circle cx={26} cy={-40} r={28} fill={dark ? "#2f7a4a" : "#4caf6d"} />
    <circle cx={-8} cy={-70} r={16} fill={dark ? "#3c9159" : "#6fcf8b"} />
  </g>
);

const Flower = ({ x, y = 252, c = "#ff6f91" }: { x: number; y?: number; c?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-1.5} y={0} width={3} height={18} fill="#3c9159" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6} cy={Math.sin((a * Math.PI) / 180) * 6} r={5} fill={c} />
    ))}
    <circle r={3.5} fill="#ffd23f" />
  </g>
);

const Sunflower = ({ x, y = 262, s = 1 }: { x: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-3} y={0} width={6} height={60} fill="#3c9159" />
    <ellipse cx={-14} cy={30} rx={12} ry={6} fill="#4caf6d" transform="rotate(-30 -14 30)" />
    {Array.from({ length: 12 }, (_, i) => (
      <ellipse
        key={i}
        cx={0}
        cy={-16}
        rx={5}
        ry={13}
        fill="#ffc107"
        transform={`rotate(${i * 30})`}
      />
    ))}
    <circle r={11} fill="#6b3f1d" />
  </g>
);

const Log = ({ x = 440, y = 262 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-26} width={240} height={52} rx={26} fill="#8a5a2b" />
    <ellipse cx={120} cy={0} rx={22} ry={26} fill="#c98a4b" />
    <ellipse cx={120} cy={0} rx={12} ry={15} fill="#8a5a2b" />
    <path d="M-90 -6 q40 8 80 0 t80 0" stroke="#6b3f1d" strokeWidth={4} fill="none" opacity={0.6} />
  </g>
);

const Mushroom = ({ x, y = 288, c = "#e53935" }: { x: number; y?: number; c?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-5} y={-10} width={10} height={14} rx={3} fill="#fbe9d0" />
    <path d="M-16 -8 a16 12 0 0 1 32 0 z" fill={c} />
    <circle cx={-6} cy={-13} r={2.5} fill="#fff" />
    <circle cx={6} cy={-12} r={2} fill="#fff" />
  </g>
);

const Stream = () => (
  <g>
    <path d="M0 250 C120 230 200 290 330 262 S560 236 800 268 L800 320 L0 320 Z" fill="#5dc8f5" />
    <path d="M0 262 C120 244 210 296 340 272 S570 250 800 280" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
    {[260, 380, 500, 610].map((x, i) => (
      <ellipse key={x} cx={x} cy={280 + (i % 2) * 8} rx={22} ry={11} fill="#b0bec5" />
    ))}
  </g>
);

const CaveHill = () => (
  <g>
    <path d="M180 320 Q400 40 640 320 Z" fill="#6d8f5a" />
    <path d="M300 320 Q400 150 500 320 Z" fill="#2b2b2b" />
    <path d="M330 320 Q400 190 470 320 Z" fill="#111" />
    <ellipse cx={400} cy={318} rx={70} ry={6} fill="#000" opacity={0.3} />
  </g>
);

const Oak = () => (
  <g transform="translate(540 300)">
    <path d="M-30 0 L-22 -120 L22 -120 L30 0 Z" fill="#6b3f1d" />
    <circle cx={0} cy={-170} r={90} fill="#2f7a4a" />
    <circle cx={-70} cy={-130} r={60} fill="#2f7a4a" />
    <circle cx={70} cy={-130} r={60} fill="#2f7a4a" />
    <circle cx={0} cy={-105} r={26} fill="#1c1c1c" />
    {/* owl */}
    <g transform="translate(0 -100)">
      <ellipse rx={18} ry={22} fill="#b58863" />
      <circle cx={-7} cy={-6} r={7} fill="#fff" />
      <circle cx={7} cy={-6} r={7} fill="#fff" />
      <circle cx={-7} cy={-6} r={3.5} fill="#222" />
      <circle cx={7} cy={-6} r={3.5} fill="#222" />
      <path d="M-3 2 L3 2 L0 8 Z" fill="#ffb300" />
    </g>
  </g>
);

const Stars = ({ n = 40, seed = 3 }) => (
  <g fill="#fff">
    {Array.from({ length: n }, (_, i) => {
      const x = ((i * 137 + seed * 31) % 800);
      const y = ((i * 89 + seed * 17) % 200) + 10;
      const r = (i % 3) * 0.7 + 1;
      return <circle key={i} cx={x} cy={y} r={r} opacity={0.5 + (i % 4) * 0.12} />;
    })}
  </g>
);

const Planet = ({ x, y, r, c, ring = false }: { x: number; y: number; r: number; c: string; ring?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={c} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.25} fill="#fff" opacity={0.25} />
    {ring && <ellipse cx={x} cy={y} rx={r * 1.7} ry={r * 0.45} fill="none" stroke="#ffd9a0" strokeWidth={6} opacity={0.8} />}
  </g>
);

const Rocket = ({ x = 520, y = 250, rot = 0, s = 1 }: { x?: number; y?: number; rot?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-30 40 L-30 -40 Q0 -110 30 -40 L30 40 Z" fill="#e53935" />
    <rect x={-30} y={-10} width={60} height={50} fill="#fff" opacity={0.15} />
    <circle cx={0} cy={-30} r={14} fill="#bfe6ff" stroke="#fff" strokeWidth={4} />
    <path d="M-30 10 L-60 55 L-30 45 Z" fill="#b71c1c" />
    <path d="M30 10 L60 55 L30 45 Z" fill="#b71c1c" />
    <path d="M-16 40 L0 70 L16 40 Z" fill="#ff9800" />
  </g>
);

const Console = () => (
  <g>
    <rect x={0} y={0} width={800} height={320} fill="#37456b" />
    <rect x={230} y={40} width={340} height={150} rx={60} fill="url(#space)" stroke="#9fb4e8" strokeWidth={10} />
    <g transform="translate(230 40)">
      <Stars n={20} seed={5} />
    </g>
    <Planet x={470} y={120} r={26} c="#7ed6ff" />
    <rect x={0} y={230} width={800} height={90} fill="#2c3757" />
    {[120, 190, 260, 560, 630, 700].map((x, i) => (
      <circle key={x} cx={x} cy={270} r={12} fill={["#ff5252", "#ffd23f", "#4caf6d"][i % 3]} />
    ))}
    <rect x={330} y={252} width={140} height={36} rx={8} fill="#9fb4e8" />
  </g>
);

const Dome = ({ x, y = 300, s = 1, c = "#9fb4e8" }: { x: number; y?: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 0 A60 60 0 0 1 60 0 Z" fill={c} />
    <rect x={-8} y={-110} width={16} height={60} fill="#cfd8ea" />
    <circle cx={0} cy={-114} r={8} fill="#ff5252" />
  </g>
);

const Coral = ({ x, y = 300, c = "#ff7f50", s = 1 }: { x: number; y?: number; c?: string; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
    <rect x={-8} y={-60} width={16} height={60} rx={8} />
    <rect x={-30} y={-42} width={16} height={42} rx={8} transform="rotate(-18 -22 -21)" />
    <rect x={14} y={-48} width={16} height={48} rx={8} transform="rotate(18 22 -24)" />
    <circle cx={0} cy={-62} r={10} />
    <circle cx={-28} cy={-46} r={9} />
    <circle cx={28} cy={-52} r={9} />
  </g>
);

const Fish = ({ x, y, c = "#ffd23f", flip = false }: { x: number; y: number; c?: string; flip?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <ellipse rx={22} ry={12} fill={c} />
    <path d="M18 0 L34 -12 L34 12 Z" fill={c} />
    <circle cx={-10} cy={-3} r={3} fill="#222" />
  </g>
);

const Seaweed = ({ x, h = 70, c = "#2e9e6b" }: { x: number; h?: number; c?: string }) => (
  <path d={`M${x} 320 q 14 -${h * 0.3} 0 -${h * 0.6} t 0 -${h * 0.4}`} stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />
);

const Shell = ({ x, y = 300, c = "#ffe0b2" }: { x: number; y?: number; c?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-16 0 A16 16 0 0 1 16 0 Z" fill={c} />
    <path d="M-10 0 L0 -14 M0 0 L0 -16 M10 0 L0 -14" stroke="#e0a96d" strokeWidth={2} />
  </g>
);

const Bell = () => (
  <g transform="translate(470 300)">
    <path d="M-70 0 Q-70 -70 -40 -110 Q0 -150 40 -110 Q70 -70 70 0 Z" fill="#c9a227" />
    <rect x={-80} y={-6} width={160} height={16} rx={8} fill="#a8861c" />
    <circle cx={0} cy={4} r={14} fill="#7a5f10" />
    <rect x={-8} y={-160} width={16} height={22} rx={5} fill="#7a5f10" />
    <path d="M-40 -100 q40 -20 80 0" stroke="#fff" strokeWidth={5} fill="none" opacity={0.35} />
  </g>
);

const Squid = () => (
  <g transform="translate(560 200)">
    <path d="M-70 0 Q-70 -120 0 -120 Q70 -120 70 0 Z" fill="#8e5bd6" />
    {[-50, -25, 0, 25, 50].map((x) => (
      <path key={x} d={`M${x} 0 q 10 40 -6 90`} stroke="#8e5bd6" strokeWidth={14} fill="none" strokeLinecap="round" />
    ))}
    <circle cx={-26} cy={-50} r={18} fill="#fff" />
    <circle cx={26} cy={-50} r={18} fill="#fff" />
    <circle cx={-22} cy={-48} r={8} fill="#222" />
    <circle cx={30} cy={-48} r={8} fill="#222" />
  </g>
);

const Boat = () => (
  <g transform="translate(560 96)">
    <path d="M-60 0 L60 0 L40 26 L-40 26 Z" fill="#8a5a2b" />
    <rect x={-3} y={-70} width={6} height={70} fill="#5d4037" />
    <path d="M3 -66 L52 -10 L3 -10 Z" fill="#fff" />
  </g>
);

/* --------------------------------------------------------------- scenes */

function Forest({ scene }: { scene: string }) {
  const night = scene === "owl";
  return (
    <g>
      <rect width={800} height={320} fill={night ? "url(#sky-dusk)" : "url(#sky-forest)"} />
      {night ? (
        <>
          <Stars n={30} seed={7} />
          <circle cx={120} cy={70} r={30} fill="#fff8e1" />
        </>
      ) : (
        <>
          <Sun />
          <Cloud x={160} y={70} />
          <Cloud x={420} y={50} s={0.8} />
        </>
      )}
      {scene === "cave" ? (
        <>
          <rect y={230} width={800} height={90} fill="#5f8f4e" />
          <CaveHill />
          <Tree x={80} s={0.9} dark />
          <Tree x={740} s={0.9} dark />
        </>
      ) : (
        <>
          <ellipse cx={400} cy={330} rx={520} ry={110} fill={night ? "#2f5a3a" : "#7ccf82"} />
          <rect y={280} width={800} height={40} fill={night ? "#2f5a3a" : "#7ccf82"} />
        </>
      )}

      {scene === "clearing" && (
        <>
          <Tree x={90} s={1.1} />
          <Tree x={200} s={0.8} dark />
          <Tree x={640} s={0.9} dark />
          <Tree x={730} s={1.15} />
          <Flower x={300} /> <Flower x={430} c="#ffd23f" /> <Flower x={560} c="#b39ddb" />
        </>
      )}
      {scene === "log" && (
        <>
          <Tree x={100} s={1} dark />
          <Tree x={720} s={1} />
          <Log />
          <Mushroom x={330} /> <Mushroom x={352} y={292} c="#ff9800" />
          <Flower x={640} c="#ffd23f" />
        </>
      )}
      {scene === "stream" && (
        <>
          <Tree x={90} s={0.9} dark />
          <Tree x={700} s={1} />
          <Stream />
          <Flower x={170} y={246} />
        </>
      )}
      {scene === "meadow" && (
        <>
          <Tree x={60} s={0.7} dark />
          <Sunflower x={300} s={1} /> <Sunflower x={400} s={1.25} /> <Sunflower x={520} s={0.9} />
          <Sunflower x={640} s={1.1} /> <Sunflower x={740} s={0.8} />
          <Flower x={240} c="#ffd23f" />
        </>
      )}
      {scene === "owl" && (
        <>
          <Tree x={100} s={0.9} dark />
          <Oak />
        </>
      )}
    </g>
  );
}

function Space({ scene }: { scene: string }) {
  if (scene === "ship") return <Console />;
  return (
    <g>
      <rect width={800} height={320} fill="url(#space)" />
      <Stars />
      {scene === "crash" && (
        <>
          <Planet x={700} y={60} r={28} c="#ff8a65" />
          <ellipse cx={400} cy={330} rx={520} ry={100} fill="#8d8d8d" />
          <ellipse cx={300} cy={300} rx={60} ry={12} fill="#6f6f6f" />
          <Rocket x={520} y={230} rot={-28} s={0.9} />
          <g fill="#cfd8dc" opacity={0.8}>
            <circle cx={560} cy={140} r={14} /> <circle cx={585} cy={118} r={18} /> <circle cx={615} cy={92} r={22} />
          </g>
        </>
      )}
      {scene === "jelly" && (
        <>
          <Planet x={120} y={70} r={26} c="#7ed6ff" ring />
          <ellipse cx={400} cy={330} rx={520} ry={110} fill="url(#jelly)" />
          {[250, 380, 520, 650].map((x, i) => (
            <ellipse key={x} cx={x} cy={262 - (i % 2) * 12} rx={46} ry={26} fill="#ffc7e3" opacity={0.9} />
          ))}
          <Rocket x={660} y={180} s={0.55} />
        </>
      )}
      {scene === "stars" && (
        <>
          <Planet x={150} y={110} r={50} c="#ffb74d" ring />
          <Planet x={640} y={80} r={30} c="#7ed6ff" />
          <Planet x={720} y={230} r={18} c="#a5d6a7" />
          <Rocket x={460} y={200} rot={20} s={0.7} />
        </>
      )}
      {scene === "station" && (
        <>
          <Planet x={700} y={60} r={24} c="#a5d6a7" />
          <rect y={280} width={800} height={40} fill="#3f4a6b" />
          <ellipse cx={400} cy={300} rx={520} ry={30} fill="#3f4a6b" />
          <Dome x={300} s={1.2} /> <Dome x={470} s={0.9} c="#c5cae9" /> <Dome x={640} s={1.05} />
          <rect x={200} y={296} width={400} height={6} fill="#ffd23f" opacity={0.7} />
        </>
      )}
      {scene === "repair" && (
        <>
          <rect y={0} width={800} height={320} fill="#37456b" />
          <rect y={240} width={800} height={80} fill="#2c3757" />
          <Rocket x={520} y={170} s={0.8} />
          <g stroke="#ffd23f" strokeWidth={4} strokeLinecap="round">
            <path d="M600 250 l14 -14 M610 262 l18 -18" />
          </g>
          <g transform="translate(300 250) rotate(-30)" fill="#cfd8dc">
            <rect x={-8} y={-50} width={16} height={80} rx={4} />
            <path d="M-20 -62 a20 20 0 1 1 40 0 l-10 0 a10 10 0 1 0 -20 0 z" />
          </g>
          {[-1, 1].map((d) => (
            <circle key={d} cx={560 + d * 40} cy={215} r={4} fill="#ffd23f" />
          ))}
        </>
      )}
    </g>
  );
}

function Ocean({ scene }: { scene: string }) {
  const deep = scene === "trench" || scene === "squid";
  return (
    <g>
      <rect width={800} height={320} fill={deep ? "url(#deep)" : "url(#water)"} />
      {!deep && (
        <g fill="#fff" opacity={0.18}>
          <path d="M120 0 L200 0 L120 320 L40 320 Z" />
          <path d="M360 0 L420 0 L330 320 L270 320 Z" />
        </g>
      )}
      {scene !== "surface" && (
        <>
          <ellipse cx={400} cy={335} rx={520} ry={70} fill={deep ? "#0d2b4a" : "#f7d794"} />
          <rect y={300} width={800} height={20} fill={deep ? "#0d2b4a" : "#f7d794"} />
        </>
      )}
      {scene === "reef" && (
        <>
          <Coral x={520} c="#ff7f50" /> <Coral x={620} c="#ff4f9a" s={0.8} /> <Coral x={720} c="#ffd23f" s={1.1} />
          <Seaweed x={300} /> <Seaweed x={330} h={50} />
          <Fish x={400} y={120} /> <Fish x={560} y={180} c="#7ed6ff" flip /> <Fish x={250} y={200} c="#ff8a65" />
        </>
      )}
      {scene === "bell" && (
        <>
          <Bell />
          <Seaweed x={220} /> <Coral x={700} c="#ff4f9a" s={0.8} />
          <Fish x={300} y={150} c="#7ed6ff" />
        </>
      )}
      {scene === "trench" && (
        <>
          {[300, 420, 540, 660].map((x, i) => (
            <circle key={x} cx={x} cy={150 + (i % 2) * 60} r={6} fill="#7ef9ff" opacity={0.9} />
          ))}
          <Fish x={520} y={120} c="#4dd0e1" />
          <path d="M520 120 l-30 -30" stroke="#7ef9ff" strokeWidth={2} />
          <Seaweed x={700} c="#1c5c4e" />
        </>
      )}
      {scene === "squid" && (
        <>
          <path d="M380 320 Q400 60 800 90 L800 320 Z" fill="#0a2240" />
          <Squid />
          <Seaweed x={300} c="#1c5c4e" />
        </>
      )}
      {scene === "sand" && (
        <>
          <Shell x={330} /> <Shell x={520} c="#f8bbd0" /> <Shell x={640} />
          <Seaweed x={720} /> <Seaweed x={250} h={50} />
          <Fish x={450} y={160} c="#ffd23f" />
          {[380, 420, 460].map((x) => (
            <ellipse key={x} cx={x} cy={312} rx={6} ry={3} fill="#e0b97a" />
          ))}
        </>
      )}
      {scene === "surface" && (
        <>
          <rect width={800} height={120} fill="#bfe6ff" />
          <Sun x={120} y={50} />
          <Boat />
          <path d="M0 120 q50 -18 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 L800 140 L0 140 Z" fill="#5dc8f5" />
          <Fish x={300} y={220} c="#ff8a65" flip />
        </>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- heroes */

function Hero({ kind, scene, world }: { kind: "fox" | "robot" | "crab"; scene: string; world: WorldId }) {
  // Where the hero stands depends on the ground in the scene.
  const y =
    world === "space" && (scene === "ship" || scene === "repair")
      ? 236
      : world === "space" && scene === "stars"
        ? 170
        : world === "ocean" && scene === "surface"
          ? 210
          : 262;
  const x = 150;
  if (kind === "fox")
    return (
      <g transform={`translate(${x} ${y})`}>
        <ellipse cx={0} cy={22} rx={34} ry={20} fill="#ff8c42" />
        <path d="M30 18 q40 -30 22 -60 q-10 30 -30 44 z" fill="#ff8c42" />
        <circle cx={20} cy={-56} r={4} fill="#fff" />
        <circle cx={-6} cy={-12} r={26} fill="#ff8c42" />
        <path d="M-28 -26 L-22 -56 L-4 -34 Z" fill="#ff8c42" />
        <path d="M16 -26 L10 -56 L-8 -34 Z" fill="#ff8c42" />
        <path d="M-24 -30 L-20 -48 L-8 -34 Z" fill="#ffd1b0" />
        <ellipse cx={-6} cy={-2} rx={14} ry={9} fill="#fff" />
        <circle cx={-14} cy={-14} r={3.5} fill="#222" />
        <circle cx={2} cy={-14} r={3.5} fill="#222" />
        <circle cx={-6} cy={-4} r={3} fill="#222" />
        <ellipse cx={-22} cy={38} rx={7} ry={4} fill="#222" />
        <ellipse cx={12} cy={40} rx={7} ry={4} fill="#222" />
      </g>
    );
  if (kind === "robot")
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-3} y={-92} width={6} height={20} fill="#cfd8dc" />
        <circle cx={0} cy={-96} r={7} fill="#ff5252" />
        <rect x={-34} y={-72} width={68} height={54} rx={14} fill="#90a4ae" />
        <rect x={-24} y={-62} width={48} height={30} rx={8} fill="#263238" />
        <circle cx={-10} cy={-47} r={6} fill="#7ef9ff" />
        <circle cx={10} cy={-47} r={6} fill="#7ef9ff" />
        <path d="M-8 -38 q8 6 16 0" stroke="#7ef9ff" strokeWidth={2.5} fill="none" />
        <rect x={-28} y={-16} width={56} height={46} rx={10} fill="#b0bec5" />
        <circle cx={0} cy={6} r={9} fill="#ffd23f" />
        <rect x={-46} y={-10} width={14} height={34} rx={7} fill="#90a4ae" />
        <rect x={32} y={-10} width={14} height={34} rx={7} fill="#90a4ae" />
        <rect x={-22} y={30} width={16} height={14} rx={4} fill="#78909c" />
        <rect x={6} y={30} width={16} height={14} rx={4} fill="#78909c" />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 26} 8 q${d * 30} -6 ${d * 34} 20`} stroke="#e53935" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M${d * 24} 24 q${d * 30} 6 ${d * 34} -20`} stroke="#e53935" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M${d * 40} 0 q${d * 26} -26 ${d * 40} 0 q${d * -14} 10 ${d * -26} 4 z`} fill="#e53935" />
          <circle cx={d * 54} cy={-14} r={12} fill="#e53935" />
        </g>
      ))}
      <ellipse cx={0} cy={10} rx={38} ry={26} fill="#ff5252" />
      <rect x={-14} y={-34} width={6} height={26} rx={3} fill="#e53935" />
      <rect x={8} y={-34} width={6} height={26} rx={3} fill="#e53935" />
      <circle cx={-11} cy={-36} r={9} fill="#fff" />
      <circle cx={11} cy={-36} r={9} fill="#fff" />
      <circle cx={-10} cy={-35} r={4.5} fill="#222" />
      <circle cx={12} cy={-35} r={4.5} fill="#222" />
      <path d="M-10 14 q10 10 20 0" stroke="#7a1f1f" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
}
