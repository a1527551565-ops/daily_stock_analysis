function hash(id: string): number {
  let value = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    value ^= id.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function FrameMark({
  id,
  aspect,
  size = "card",
}: {
  id: string;
  aspect: string;
  size?: "card" | "lead";
}) {
  const seed = hash(id);
  const blocks = [0, 1, 2, 3].map((step) => {
    const slice = Math.imul(seed, step + 5);
    return {
      x: (slice % 110) - 8,
      y: ((slice >>> 5) % 70) - 6,
      w: 28 + ((slice >>> 9) % 48),
      h: 12 + ((slice >>> 13) % 28),
      opacity: 0.08 + (step % 4) * 0.06,
    };
  });
  const copperX = 18 + (seed % 100);

  return (
    <div className={size === "lead" ? "frame-stage lead" : "frame-stage"}>
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="160" height="100" fill="#221f1b" />
        {blocks.map((block) => (
          <rect
            key={`${block.x}-${block.y}-${block.w}`}
            x={block.x}
            y={block.y}
            width={block.w}
            height={block.h}
            fill="#f4efe4"
            opacity={block.opacity}
          />
        ))}
        <rect x={copperX} y="0" width="5" height="100" fill="#9a4516" />
        <path d="M6 6 H16 M6 6 V16 M154 6 H144 M154 6 V16 M6 94 H16 M6 94 V84 M154 94 H144 M154 94 V84" stroke="#f4efe4" strokeWidth="0.7" fill="none" opacity="0.75" />
        <text x="10" y="90" fill="#f4efe4" fontSize="6" fontFamily="sans-serif">
          {aspect} / {String((seed % 900) + 100)}
        </text>
      </svg>
    </div>
  );
}
