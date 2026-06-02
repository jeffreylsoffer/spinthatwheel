"use client";

// Faithful recreation of the show's "Golden Rule" framed painting:
// ornate gold frame, cream interior, angel wings + halo around a coral pill,
// and a cream cartouche plaque reading "Golden Rule".

interface GoldenRuleCardProps {
  name: string;
  onClick?: () => void;
  bg?: string;
  textColor?: string;
}

// Build one wing (fans up-and-left from a pivot). Right wing is a mirror.
function buildWing(pivotX: number, pivotY: number) {
  const feather = (len: number, wid: number) =>
    `M0 0 C ${wid} ${-len * 0.35}, ${wid * 0.5} ${-len * 0.85}, 0 ${-len} C ${-wid * 0.5} ${-len * 0.85}, ${-wid} ${-len * 0.35}, 0 0 Z`;

  const rows = [
    { count: 8, a0: 95, a1: 168, len: 100, wid: 18, fill: "#e6e3da", off: 4 },
    { count: 7, a0: 100, a1: 165, len: 66, wid: 15, fill: "#f7f5ef", off: 16 },
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
  const leftWing = buildWing(166, 214);

  return (
    <button onClick={onClick} className="w-full cursor-pointer hover:scale-[1.02] transition-transform" aria-label="Golden Rule — tap to swap">
      <svg viewBox="0 0 460 372" className="w-full h-auto drop-shadow-xl">
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a531f" />
            <stop offset="25%" stopColor="#c99a36" />
            <stop offset="50%" stopColor="#f6da82" />
            <stop offset="75%" stopColor="#bd8a2c" />
            <stop offset="100%" stopColor="#6e4a1c" />
          </linearGradient>
          <linearGradient id="goldInner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6da82" />
            <stop offset="50%" stopColor="#b9842a" />
            <stop offset="100%" stopColor="#f6da82" />
          </linearGradient>
          <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fcecca" />
            <stop offset="100%" stopColor="#f1c685" />
          </linearGradient>
          <pattern id="beading" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="2.1" fill="#fbe9a6" opacity="0.55" />
            <circle cx="5" cy="5" r="1" fill="#6e4a1c" opacity="0.4" />
          </pattern>
        </defs>

        {/* hanging chains */}
        <line x1="150" y1="0" x2="150" y2="22" stroke="#9a9a9a" strokeWidth="2" />
        <line x1="310" y1="0" x2="310" y2="22" stroke="#9a9a9a" strokeWidth="2" />

        {/* ornate frame */}
        <rect x="14" y="22" width="432" height="300" rx="8" fill="url(#gold)" />
        <rect x="22" y="30" width="416" height="284" rx="6" fill="url(#beading)" />
        <rect x="34" y="42" width="392" height="260" rx="4" fill="url(#goldInner)" />
        <rect x="44" y="52" width="372" height="240" rx="3" fill="#8b6516" />
        {/* cream interior */}
        <rect x="50" y="58" width="360" height="228" rx="2" fill="url(#cream)" />

        {/* halo */}
        <ellipse cx="230" cy="95" rx="50" ry="13" fill="none" stroke="#d9b441" strokeWidth="6" />

        {/* wings */}
        <g>
          {leftWing.map((f, i) => (
            <path key={`l${i}`} d={f.d} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`} fill={f.fill} stroke="#cfcabd" strokeWidth="0.8" />
          ))}
        </g>
        <g transform="translate(460 0) scale(-1 1)">
          {leftWing.map((f, i) => (
            <path key={`r${i}`} d={f.d} transform={`translate(${f.x} ${f.y}) rotate(${f.rot})`} fill={f.fill} stroke="#cfcabd" strokeWidth="0.8" />
          ))}
        </g>

        {/* pill (uses the rule's color when swapped in) */}
        <rect x="148" y="124" width="164" height="100" rx="22" fill={bg} stroke="rgba(0,0,0,0.25)" strokeWidth="4" />
        <foreignObject x="148" y="124" width="164" height="100">
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 10px", color: textColor, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.05, fontSize: name.length > 14 ? "20px" : "30px", fontFamily: "'League Gothic', sans-serif" }}>
            {name}
          </div>
        </foreignObject>

        {/* cartouche plaque */}
        <g>
          <path d="M150 318 Q160 308 175 310 L285 310 Q300 308 310 318 Q300 328 310 340 Q300 350 285 348 L175 348 Q160 350 150 340 Q160 328 150 318 Z" fill="#f7efd9" stroke="#d8c89a" strokeWidth="1.5" />
          <text x="230" y="334" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontWeight="700" fontSize="22" fill="#3a3a3a">Golden Rule</text>
        </g>
      </svg>
    </button>
  );
};

export default GoldenRuleCard;
