const RANK_THEME = {
  'E-Rank Hunter':         { primary: '#7c8aa6', secondary: '#3d4a6a', glow: 'rgba(124, 138, 166, 0.5)', mark: 'E' },
  'D-Rank Hunter':         { primary: '#6dffb5', secondary: '#1f6b4a', glow: 'rgba(109, 255, 181, 0.55)', mark: 'D' },
  'C-Rank Hunter':         { primary: '#5aaaff', secondary: '#1c4480', glow: 'rgba(90, 170, 255, 0.55)', mark: 'C' },
  'B-Rank Hunter':         { primary: '#b186ff', secondary: '#4a2a8a', glow: 'rgba(177, 134, 255, 0.55)', mark: 'B' },
  'A-Rank Hunter':         { primary: '#ffd66b', secondary: '#8c6e1f', glow: 'rgba(255, 214, 107, 0.6)', mark: 'A' },
  'S-Rank Hunter':         { primary: '#ff8da3', secondary: '#7a2842', glow: 'rgba(255, 141, 163, 0.6)', mark: 'S' },
  'National Level Hunter': { primary: '#ff6b9c', secondary: '#7d1f4a', glow: 'rgba(255, 107, 156, 0.6)', mark: 'N' },
  'Monarch':               { primary: '#ffe9a0', secondary: '#a3531f', glow: 'rgba(255, 233, 160, 0.8)', mark: '♛' }
};

export default function RankSeal({ rank, size = 92 }) {
  const theme = RANK_THEME[rank] || RANK_THEME['E-Rank Hunter'];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="rank-seal"
      style={{ filter: `drop-shadow(0 0 14px ${theme.glow})` }}
    >
      <defs>
        <radialGradient id={`g-${theme.mark}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.9" />
          <stop offset="60%" stopColor={theme.secondary} stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000814" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id={`r-${theme.mark}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={theme.primary} />
          <stop offset="100%" stopColor={theme.secondary} />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#r-${theme.mark})`} strokeWidth="1.5" opacity="0.9" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={theme.primary} strokeOpacity="0.3" strokeWidth="0.6" />

      {/* Tick marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 50 + Math.cos(angle) * 42;
        const y1 = 50 + Math.sin(angle) * 42;
        const x2 = 50 + Math.cos(angle) * 46;
        const y2 = 50 + Math.sin(angle) * 46;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.primary} strokeOpacity="0.7" strokeWidth="0.8" />;
      })}

      {/* Inner shield */}
      <path
        d="M 50 16 L 76 30 L 76 56 C 76 70 64 80 50 84 C 36 80 24 70 24 56 L 24 30 Z"
        fill={`url(#g-${theme.mark})`}
        stroke={theme.primary}
        strokeWidth="1"
      />

      {/* Diagonal accent */}
      <path
        d="M 50 16 L 76 30 L 76 38 L 50 24 Z"
        fill="white"
        opacity="0.08"
      />

      {/* Rank mark */}
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fill={theme.primary}
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: theme.mark.length > 1 ? 22 : 32,
          fontWeight: 800,
          letterSpacing: 2,
          filter: `drop-shadow(0 0 6px ${theme.glow})`
        }}
      >
        {theme.mark}
      </text>
    </svg>
  );
}
