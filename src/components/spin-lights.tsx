"use client";

// Game-show "mover" lights: colored orbs that sweep across while the wheel spins.
const ORBS = [
  { c: "#ff6f5e", left: "25%", top: "30%", size: 380, dur: 4.2, delay: 0, anim: "orb-sweep-x" },
  { c: "#2dd4d4", left: "60%", top: "25%", size: 440, dur: 4.8, delay: 0.4, anim: "orb-sweep-y" },
  { c: "#ffd54a", left: "45%", top: "65%", size: 400, dur: 4.5, delay: 0.8, anim: "orb-sweep-x" },
];

export default function SpinLights({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" style={{ mixBlendMode: "screen", animation: "spin-lights-in 0.8s ease-out both" }}>
      {ORBS.map((o, i) => (
        <span
          key={i}
          className="absolute rounded-full spin-orb"
          style={{
            width: o.size,
            height: o.size,
            left: o.left,
            top: o.top,
            marginLeft: -o.size / 2,
            marginTop: -o.size / 2,
            background: `radial-gradient(circle, ${o.c} 0%, ${o.c}00 70%)`,
            filter: "blur(6px)",
            opacity: 0.85,
            animationName: o.anim,
            animationDuration: `${o.dur}s`,
            animationDelay: `${o.delay}s`,
            animationDirection: i % 2 ? "reverse" : "normal",
          }}
        />
      ))}
    </div>
  );
}
