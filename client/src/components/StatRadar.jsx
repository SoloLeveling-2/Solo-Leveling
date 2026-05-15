const LABELS = ['STR', 'END', 'DIS'];

export default function StatRadar({ stats, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const values = [
    Math.max(8, stats.strength),
    Math.max(8, stats.endurance),
    Math.max(8, stats.discipline)
  ];

  const angle = (i) => (-Math.PI / 2) + (i / 3) * Math.PI * 2;

  const polyPoint = (value, i) => {
    const r = (value / 100) * radius;
    return [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  };

  const polygon = values.map((v, i) => polyPoint(v, i).join(',')).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="stat-radar">
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5aaaff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8b6dff" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Concentric rings */}
      {[0.25, 0.5, 0.75, 1].map((pct, i) => {
        const points = [0, 1, 2].map((idx) => {
          const r = pct * radius;
          return [cx + Math.cos(angle(idx)) * r, cy + Math.sin(angle(idx)) * r].join(',');
        }).join(' ');
        return (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="rgba(90, 170, 255, 0.2)"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Axis lines */}
      {[0, 1, 2].map((i) => {
        const [x, y] = polyPoint(100, i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(90, 170, 255, 0.25)" strokeWidth="0.6" />;
      })}

      {/* Data polygon */}
      <polygon
        points={polygon}
        fill="url(#radar-fill)"
        stroke="#9ed1ff"
        strokeWidth="1.4"
        style={{ filter: 'drop-shadow(0 0 8px rgba(90,170,255,0.6))' }}
      />

      {/* Data points */}
      {values.map((v, i) => {
        const [x, y] = polyPoint(v, i);
        return <circle key={i} cx={x} cy={y} r="3.2" fill="#9ed1ff" style={{ filter: 'drop-shadow(0 0 6px rgba(90,170,255,0.7))' }} />;
      })}

      {/* Labels */}
      {LABELS.map((label, i) => {
        const [x, y] = polyPoint(126, i);
        return (
          <g key={label}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Orbitron, sans-serif"
              fontSize="11"
              fontWeight="700"
              fill="#9ed1ff"
              letterSpacing="2"
            >
              {label}
            </text>
            <text
              x={x}
              y={y + 14}
              textAnchor="middle"
              fontFamily="Orbitron, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill="#ecf2ff"
            >
              {values[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
