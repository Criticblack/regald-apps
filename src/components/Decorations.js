// Grid background SVG
export function GridBg({ opacity = 0.04 }) {
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

// Terminal cursor blink
export function Cursor() {
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 20, background: 'var(--accent)',
      marginLeft: 4, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom',
    }} />
  );
}

// Decorative code lines
export function CodeSnippet({ lines = 4, style = {} }) {
  const widths = Array.from({ length: lines }, (_, i) => 30 + ((i * 37 + 13) % 55));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {widths.map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-4)',
            width: 16, textAlign: 'right', userSelect: 'none',
          }}>{i + 1}</span>
          <div style={{
            height: 6, borderRadius: 3, width: `${w}%`,
            background: i === 1 ? 'var(--accent-dim)' : 'var(--line)',
          }} />
        </div>
      ))}
    </div>
  );
}

// Gradient orbs (fixed background)
export function GradientOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <GridBg opacity={0.035} />
      <div style={{
        position: 'absolute', top: '-15%', right: '-8%', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,212,170,0.04) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(100,120,255,0.03) 0%, transparent 60%)',
      }} />
    </div>
  );
}
