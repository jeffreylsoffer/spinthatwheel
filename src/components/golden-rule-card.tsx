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
  const FRAME = "M14 16 H446 V284 H14 Z M50 52 H410 V248 H50 Z";

  return (
    <button onClick={onClick} className="w-full cursor-pointer transition-transform hover:scale-[1.02]" aria-label="Golden Rule — tap to swap">
      <svg viewBox="0 0 460 340" className="w-full h-auto">
        <defs>
          <pattern id="woodH" patternUnits="userSpaceOnUse" width="120" height="36" patternTransform="translate(50 16)">
            <image href="/wood.jpg" width="120" height="36" preserveAspectRatio="xMidYMid slice" />
          </pattern>
          <pattern id="woodHB" patternUnits="userSpaceOnUse" width="120" height="36" patternTransform="translate(50 32)">
            <image href="/wood.jpg" width="120" height="36" preserveAspectRatio="xMidYMid slice" />
          </pattern>
          <pattern id="woodV" patternUnits="userSpaceOnUse" width="36" height="120" patternTransform="translate(14 90)">
            <image href="/wood.jpg" width="120" height="36" preserveAspectRatio="xMidYMid slice" transform="translate(36 0) rotate(90)" />
          </pattern>
          {/* metallic gold with a diagonal sheen */}
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4e340f" />
            <stop offset="18%" stopColor="#8a6620" />
            <stop offset="38%" stopColor="#c2963a" />
            <stop offset="50%" stopColor="#d3ab52" />
            <stop offset="62%" stopColor="#a87d2a" />
            <stop offset="82%" stopColor="#6e4a1c" />
            <stop offset="100%" stopColor="#422c0d" />
          </linearGradient>
          <linearGradient id="goldLip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9b14a" />
            <stop offset="45%" stopColor="#a9781f" />
            <stop offset="100%" stopColor="#6e4a1c" />
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
          <filter id="softLine" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" />
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

        {/* lit interior (the "painting") */}
        <rect x="50" y="52" width="360" height="196" rx="4" fill="url(#cream)" />
        <rect x="50" y="52" width="360" height="196" rx="4" fill="url(#shade)" opacity="0.5" />

        {/* mitered wood rails: grain follows each side, joined at 45° corners */}
        <g filter="url(#softShadow)" stroke="#4a3110" strokeWidth="1">
          <path d="M14 16 L446 16 L410 52 L50 52 Z" fill="url(#woodH)" />
          <path d="M14 284 L446 284 L410 248 L50 248 Z" fill="url(#woodHB)" />
          <path d="M14 16 L50 52 L50 248 L14 284 Z" fill="url(#woodV)" />
          <path d="M446 16 L410 52 L410 248 L446 284 Z" fill="url(#woodV)" />
        </g>
        {/* gilded gold wash over the wood */}
        <path fillRule="evenodd" fill="url(#gold)" style={{ mixBlendMode: "overlay" }} d={FRAME} />
        {/* outer molding rim */}
        <g filter="url(#softLine)">
          <rect x="12" y="14" width="436" height="272" fill="none" stroke="url(#goldLip)" strokeWidth="4" />
          <rect x="9" y="11" width="442" height="278" fill="none" stroke="#4a3110" strokeWidth="1.5" opacity="0.8" />
        </g>

        {/* inner gold molding + recessed lip around the window */}
        <g filter="url(#softLine)">
          <rect x="47" y="49" width="366" height="202" fill="none" stroke="url(#goldLip)" strokeWidth="5" />
          <rect x="50" y="52" width="360" height="196" fill="none" stroke="#5e3f12" strokeWidth="1.5" opacity="0.8" />
        </g>
        {/* soft recess shadow so the painting sits inside the frame */}
        <rect x="50" y="52" width="360" height="196" fill="none" stroke="#2a1d09" strokeWidth="3" opacity="0.25" style={{ filter: "blur(2px)" }} />

        {/* interior content, scaled down slightly for more frame padding */}
        <g transform="translate(23 15) scale(0.9)">
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
        </g>

        {/* cartouche plaque */}
        <g filter="url(#softShadow)">
          <path d="M150 253 Q160 243 175 245 L285 245 Q300 243 310 253 Q300 263 310 275 Q300 285 285 283 L175 283 Q160 285 150 275 Q160 263 150 253 Z" fill="#f7efd9" stroke="#d8c89a" strokeWidth="1.5" />
        </g>
        <text x="230" y="264" textAnchor="middle" dominantBaseline="central" fontFamily="'Playfair Display', Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="#6e4a1c">Golden Rule</text>
      </svg>
    </button>
  );
};

export default GoldenRuleCard;
