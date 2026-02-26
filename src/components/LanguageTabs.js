'use client';

const LANGS = [
  { code: 'ro', label: 'RO' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export default function LanguageTabs({ activeLang, onSwitch }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
      {LANGS.map(lang => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onSwitch(lang.code)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            padding: '6px 16px',
            borderRadius: 6,
            border: '1.5px solid',
            borderColor: activeLang === lang.code ? 'var(--accent, #00d4aa)' : 'var(--border, #333)',
            background: activeLang === lang.code ? 'var(--accent, #00d4aa)' : 'transparent',
            color: activeLang === lang.code ? '#0a0b0f' : 'var(--text-muted, #999)',
            cursor: 'pointer',
            fontWeight: activeLang === lang.code ? 700 : 400,
            transition: 'all 0.15s',
            letterSpacing: '0.08em',
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

export { LANGS };
