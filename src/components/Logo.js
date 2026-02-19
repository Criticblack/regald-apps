export default function Logo({ size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.26,
      background: 'linear-gradient(135deg, var(--accent), #00a888)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 20px rgba(0,212,170,0.15)', flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontWeight: 700,
        fontSize: size * 0.42, color: '#0a0b0f',
      }}>R</span>
    </div>
  );
}
