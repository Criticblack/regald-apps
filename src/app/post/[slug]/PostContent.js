'use client';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import Logo from '@/components/Logo';
import Comments from '@/components/Comments';
import Rating from '@/components/Rating';
import { GradientOrbs } from '@/components/Decorations';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export default function PostContent({ post }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <GradientOrbs />
      <Navbar />

      <article className="container" style={{ maxWidth: 780, paddingTop: 48, paddingBottom: 80, position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link href="/" style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.target.style.color = 'var(--accent)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-4)'}
        >← înapoi</Link>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span className={post.type === 'video' ? 'badge badge-video' : 'badge badge-text'}>
            {post.type === 'video' ? '▶ STREAM' : '</> TEXT'}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>{date}</span>
          {post.duration && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>· {post.duration}</span>}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--heading)', fontSize: 38, fontWeight: 700,
          lineHeight: 1.15, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.03em',
        }}>{post.title}</h1>

        {post.description && (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 17, lineHeight: 1.7, color: 'var(--text-2)', marginBottom: 32, maxWidth: 600 }}>
            {post.description}
          </p>
        )}

        {/* Video */}
        {post.type === 'video' && post.youtube_url && (
          <div style={{ marginBottom: 40 }}>
            <VideoPlayer youtubeUrl={post.youtube_url} duration={post.duration} large />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div className="prose" style={{
            fontFamily: 'var(--sans)', fontSize: 16, lineHeight: 1.85, color: 'var(--text-2)',
          }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              h1: ({children}) => <h1 style={{ fontFamily: 'var(--heading)', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginTop: 48, marginBottom: 16 }}>{children}</h1>,
              h2: ({children}) => <h2 style={{ fontFamily: 'var(--heading)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginTop: 40, marginBottom: 12 }}>{children}</h2>,
              h3: ({children}) => <h3 style={{ fontFamily: 'var(--heading)', fontSize: 18, fontWeight: 600, color: 'var(--text)', marginTop: 32, marginBottom: 10 }}>{children}</h3>,
              p: ({children}) => <p style={{ marginBottom: 20 }}>{children}</p>,
              a: ({children, href}) => <a href={href} style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 }} target="_blank" rel="noopener">{children}</a>,
              blockquote: ({children}) => <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 20, margin: '24px 0', color: 'var(--text-3)', fontStyle: 'italic' }}>{children}</blockquote>,
              code: ({children, className}) => className ? (
                <pre style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '20px 24px', overflow: 'auto', margin: '24px 0' }}>
                  <code style={{ fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{children}</code>
                </pre>
              ) : (
                <code style={{ fontFamily: 'var(--mono)', fontSize: '0.9em', background: 'var(--card)', border: '1px solid var(--line)', padding: '2px 6px', borderRadius: 4, color: 'var(--accent)' }}>{children}</code>
              ),
              ul: ({children}) => <ul style={{ paddingLeft: 24, marginBottom: 20 }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: 8 }}>{children}</li>,
              strong: ({children}) => <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{children}</strong>,
            }}>
              {post.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
            {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <Rating postId={post.id} />
        <Comments postId={post.id} />
      </article>

      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-alt)' }}>
        <div className="container footer-inner" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={24} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>© 2026 regald.apps</span>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>made with caffeine && kotlin</span>
        </div>
      </footer>
    </div>
  );
}
