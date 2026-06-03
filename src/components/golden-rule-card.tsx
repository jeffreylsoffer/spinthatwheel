"use client";

// Recreation of the show's "Golden Rule" framed painting:
// ornate gilded frame, lit cream interior, angel wings + halo around the rule pill.

interface GoldenRuleCardProps {
  name: string;
  onClick?: () => void;
  bg?: string;
  textColor?: string;
}

// One wing, fanning up-and-out from a pivot. The right wing is a mirror.
function buildWing(pivotX: number, pivotY: number) {
  const feather = (len: number, wid: number) =>
    `M0 0 C ${wid} ${-len * 0.35}, ${wid * 0.5} ${-len * 0.85}, 0 ${-len} C ${-wid * 0.5} ${-len * 0.85}, ${-wid} ${-len * 0.35}, 0 0 Z`;

  const rows = [
    { count: 9, a0: 92, a1: 172, len: 104, wid: 17, fill: "#d7d3c8", off: 2 },
    { count: 8, a0: 96, a1: 168, len: 78, wid: 15, fill: "#ece9e1", off: 12 },
    { count: 6, a0: 102, a1: 160, len: 50, wid: 13, fill: "#ffffff", off: 24 },
  ];

  const feathers: { d: string; x: number; y: number; rot: number; fill: string }[] = [];
  for (const row of rows) {
    for (let i = 0; i < row.count; i++) {
      const t = row.count === 1 ? 0 : i / (row.count - 1);
      const ang = row.a0 + t * (row.a1 - row.a0);
      const rad = (ang * Math.PI) / 180;
      const x = pivotX + row.off * Math.cos(rad);
      const y = pivotY - row.off * Math.sin(rad);
      feathers.push({ d: feather(row.len, row.wid), x, y, rot: 90 - ang, fill: row.fill });
    }
  }
  return feathers;
}

const GoldenRuleCard = ({ name, onClick, bg = "#e8835f", textColor = "#4a3b32" }: GoldenRuleCardProps) => {
  const leftWing = buildWing(160, 196);

  return (
    <button onClick={onClick} className="w-full cursor-pointer transition-transform hover:scale-[1.02]" aria-label="Golden Rule — tap to swap">
      <svg viewBox="0 0 460 340" className="w-full h-auto">
        <defs>
          {/* metallic gold with a diagonal sheen */}
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a531f" />
            <stop offset="18%" stopColor="#caa03b" />
            <stop offset="38%" stopColor="#f8e29a" />
            <stop offset="50%" stopColor="#fff4cf" />
            <stop offset="62%" stopColor="#e7c469" />
            <stop offset="82%" stopColor="#a9781f" />
            <stop offset="100%" stopColor="#6e4a1c" />
          </linearGradient>
          <linearGradient id="goldLip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff0c2" />
            <stop offset="45%" stopColor="#c79a36" />
            <stop offset="100%" stopColor="#8a611f" />
          </linearGradient>
          {/* warm, lit interior */}
          <radialGradient id="cream" cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor="#fdeed0" />
            <stop offset="65%" stopColor="#f6d6a3" />
            <stop offset="100%" stopColor="#e7b878" />
          </radialGradient>
          <linearGradient id="haloGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c79a2e" />
            <stop offset="50%" stopColor="#ffe89a" />
            <stop offset="100%" stopColor="#c79a2e" />
          </linearGradient>
          <linearGradient id="featherGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cfcabd" />
          </linearGradient>
          {/* pill sheen (top highlight) and shade (bottom) */}
          <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>
          <pattern id="beading" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="5.5" cy="5.5" r="2.4" fill="#fff2bf" opacity="0.6" />
            <circle cx="5.5" cy="6.4" r="2.4" fill="#6e4a1c" opacity="0.35" />
          </pattern>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
          </filter>
          <filter id="haloGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* hanging chains */}
        <line x1="150" y1="0" x2="150" y2="16" stroke="#8a8a8a" strokeWidth="2" />
        <line x1="310" y1="0" x2="310" y2="16" stroke="#8a8a8a" strokeWidth="2" />

        {/* ornate frame */}
        <g filter="url(#softShadow)">
          <rect x="14" y="16" width="432" height="268" rx="12" fill="url(#gold)" />
        </g>
        <rect x="22" y="24" width="416" height="252" rx="10" fill="url(#beading)" />
        <rect x="34" y="36" width="392" height="228" rx="8" fill="url(#goldLip)" />
        <rect x="44" y="46" width="372" height="208" rx="5" fill="#7a5616" />
        {/* lit interior */}
        <rect x="50" y="52" width="360" height="196" rx="4" fill="url(#cream)" />
        {/* subtle inner vignette for depth */}
        <rect x="50" y="52" width="360" height="196" rx="4" fill="url(#shade)" opacity="0.5" />

        {/* halo */}
        <ellipse cx="230" cy="91" rx="50" ry="13" fill="none" stroke="url(#haloGrad)" strokeWidth="7" filter="url(#haloGlow)" />

        {/* wings (soft shadow as a group) */}
        <g filter="url(#softShadow)">
          {leftWing.map((f, i) => (
            <path key={`l${i}`} d={f.d} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`} fill="url(#featherGrad)" stroke="#c4bfb1" strokeWidth="0.6" />
          ))}
          <g transform="translate(460 0) scale(-1 1)">
            {leftWing.map((f, i) => (
              <path key={`r${i}`} d={f.d} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`} fill="url(#featherGrad)" stroke="#c4bfb1" strokeWidth="0.6" />
            ))}
          </g>
        </g>

        {/* pill (uses the rule's color when swapped in) */}
        <g filter="url(#softShadow)">
          <rect x="148" y="122" width="164" height="100" rx="22" fill={bg} stroke="rgba(0,0,0,0.28)" strokeWidth="4" />
          <rect x="148" y="122" width="164" height="100" rx="22" fill="url(#sheen)" />
          <rect x="148" y="122" width="164" height="100" rx="22" fill="url(#shade)" />
        </g>
        <foreignObject x="148" y="122" width="164" height="100">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 10px", color: textColor, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.05, fontSize: name.length > 14 ? "20px" : "30px", fontFamily: "'League Gothic', sans-serif" }}>
            {name}
          </div>
        </foreignObject>

        {/* cartouche plaque */}
        <g filter="url(#softShadow)">
          <path d="M150 280 Q160 270 175 272 L285 272 Q300 270 310 280 Q300 290 310 302 Q300 312 285 310 L175 310 Q160 312 150 302 Q160 290 150 280 Z" fill="#f7efd9" stroke="#d8c89a" strokeWidth="1.5" />
        </g>
        <text x="230" y="296" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="#3a3a3a">Golden Rule</text>
      </svg>
    </button>
  );
};

export default GoldenRuleCard;
