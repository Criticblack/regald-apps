'use client';
import { useState } from 'react';
import { GridBg, CodeSnippet } from './Decorations';

function extractYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^&?\s]+)/);
  return m ? m[1] : null;
}

export default function VideoPlayer({ youtubeUrl, duration, large = false }) {
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState(false);
  const ytId = extractYoutubeId(youtubeUrl);

  if (playing && ytId) {
    return (
      <div style={{ borderRadius: large ? 16 : 12, overflow: 'hidden', aspectRatio: '16/9' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; encrypted-media" allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => ytId && setPlaying(true)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: large ? 16 : 12, overflow: 'hidden',
        aspectRatio: '16/9', position: 'relative', cursor: ytId ? 'pointer' : 'default',
        background: 'linear-gradient(135deg, #0f1118 0%, #161a24 50%, #0d1015 100%)',
        border: `1px solid ${hover ? 'var(--accent-dim)' : 'var(--line)'}`,
        transition: 'all 0.4s', transform: hover ? 'scale(1.005)' : 'none',
        boxShadow: hover ? '0 0 40px rgba(0,212,170,0.06)' : 'none',
      }}
    >
      {/* YouTube thumbnail */}
      {ytId && (
        <img
          src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
          alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.3, filter: 'saturate(0.4)',
          }}
          onError={e => e.target.style.display = 'none'}
        />
      )}

      <GridBg opacity={0.08} />

      {/* Decorative code */}
      <div style={{ position: 'absolute', top: 16, left: 16, right: '40%', opacity: 0.3 }}>
        <CodeSnippet lines={5} />
      </div>

      {/* Glow orb */}
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '60%', height: '60%',
        background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)',
      }} />

      {/* Play button */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 3,
      }}>
        <div style={{
          width: large ? 64 : 48, height: large ? 64 : 48,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hover ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          border: hover ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
          transition: 'all 0.35s', backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            width: 0, height: 0,
            borderTop: `${large ? 11 : 8}px solid transparent`,
            borderBottom: `${large ? 11 : 8}px solid transparent`,
            borderLeft: `${large ? 18 : 13}px solid ${hover ? '#0a0b0f' : '#fff'}`,
            marginLeft: 3, transition: 'border-color 0.3s',
          }} />
        </div>
      </div>

      {/* Duration */}
      {duration && (
        <div style={{
          position: 'absolute', bottom: large ? 14 : 10, right: large ? 14 : 10,
          fontFamily: 'var(--mono)', fontSize: 11, color: '#fff',
          background: 'rgba(0,0,0,0.7)', padding: '3px 10px',
          borderRadius: 6, backdropFilter: 'blur(4px)', zIndex: 4,
        }}>{duration}</div>
      )}

      {/* Stream label */}
      <div style={{
        position: 'absolute', top: large ? 14 : 10, right: large ? 14 : 10,
        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--accent)',
        background: 'rgba(0,212,170,0.1)', padding: '3px 9px',
        borderRadius: 4, border: '1px solid rgba(0,212,170,0.2)', zIndex: 4,
      }}>stream</div>
    </div>
  );
}

export { extractYoutubeId };
