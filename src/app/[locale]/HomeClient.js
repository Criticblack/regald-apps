'use client';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import VideoPlayer from '@/components/VideoPlayer';
import Roadmap from '@/components/Roadmap';
import Reveal from '@/components/Reveal';
import Logo from '@/components/Logo';
import { GridBg, Cursor, CodeSnippet, GradientOrbs } from '@/components/Decorations';

const LOCALE_MAP = { en: 'en-US', ro: 'ro-RO', ru: 'ru-RU' };

function localizedField(field, locale) {
  if (!field) return '';
  if (typeof field === 'object') return field[locale] || field.en || field.ro || '';
  return field;
}

export default function HomeClient({ posts, categories = [] }) {
  const [filter, setFilter] = useState('all');
  const [loaded, setLoaded] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const featured = posts[0];
  const rest = posts.slice(1);
  const filtered = filter === 'all' ? rest : rest.filter(p =>
    p.type === filter || p.categories?.slug === filter
  );

  const featDate = featured?.published_at
    ? new Date(featured.published_at).toLocaleDateString(LOCALE_MAP[locale] || 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <GradientOrbs />
      <Navbar />

      {/* ─── HERO ─── */}
      {featured && (
        <header className="container" style={{ paddingTop: 52, position: 'relative', zIndex: 1 }}>
          <div className="hero-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, alignItems: 'center',
          }}>
            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(24px)',
              transition: 'all 0.9s cubic-bezier(.22,1,.36,1) 0.1s',
            }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)',
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                  boxShadow: '0 0 12px var(--accent)', animation: 'float 3s ease-in-out infinite',
                }} />
                {featured.type === 'video' ? t('hero.latestStream') : t('hero.latestPost')}
              </div>

              <Link href={`/post/${featured.slug}`} style={{ textDecoration: 'none' }}>
                <h1 className="hero-title" style={{
                  fontFamily: 'var(--heading)', fontSize: 42, fontWeight: 700,
                  lineHeight: 1.12, color: 'var(--text)', marginBottom: 18,
                  letterSpacing: '-0.03em', transition: 'color 0.3s',
                }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >
                  {localizedField(featured.title, locale)}
                </h1>
              </Link>

              {featured.description && (
                <p style={{
                  fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.75,
                  color: 'var(--text-2)', maxWidth: 420, marginBottom: 28,
                }}>{localizedField(featured.description, locale)}</p>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {featured.tags?.map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
                {featured.duration && (
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, padding: '5px 14px',
                    borderRadius: 8, background: 'var(--accent)', color: '#0a0b0f', fontWeight: 600,
                  }}>▶ {featured.duration}</span>
                )}
              </div>
            </div>

            <div style={{
              opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(24px)',
              transition: 'all 0.9s cubic-bezier(.22,1,.36,1) 0.3s',
            }}>
              {featured.type === 'video' && featured.youtube_url ? (
                <VideoPlayer youtubeUrl={featured.youtube_url} duration={featured.duration} large />
              ) : (
                <div style={{
                  borderRadius: 16, aspectRatio: '16/9', position: 'relative',
                  background: 'linear-gradient(135deg, var(--card), var(--bg-alt))',
                  border: '1px solid var(--line)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GridBg opacity={0.06} />
                  <div style={{ position: 'relative', zIndex: 1, padding: 32 }}>
                    <CodeSnippet lines={8} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ─── TERMINAL QUOTE ─── */}
      <Reveal>
        <div className="container" style={{ paddingTop: 48, position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 12, padding: '20px 28px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)' }}>$</span> {t('terminal.quote')}
              <Cursor />
            </p>
          </div>
        </div>
      </Reveal>

      {/* ─── POSTS ─── */}
      <section className="container" style={{ paddingTop: 44, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 8, letterSpacing: '0.08em' }}>
                {t('posts.sectionComment')}
              </div>
              <h2 style={{ fontFamily: 'var(--heading)', fontSize: 28, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {t('posts.allPosts')}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['all', t('posts.filterAll')],
                ...categories.map(c => [c.slug, localizedField(c.name, locale)])
              ].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`filter-btn ${filter === k ? 'active' : ''}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.06}>
              <PostCard post={post} />
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-4)' }}>
                {t('posts.noPostsFilter')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── ROADMAP ─── */}
      <Roadmap embedded />

      {/* ─── ABOUT ─── */}
      <section id="despre" className="container" style={{ paddingTop: 64, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{
                width: 100, height: 100, borderRadius: 20,
                background: 'linear-gradient(135deg, var(--card), var(--bg-alt))',
                border: '1px solid var(--line)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: 20, position: 'relative',
                boxShadow: '0 0 40px rgba(0,212,170,0.05)', overflow: 'hidden',
              }}>
                <GridBg opacity={0.1} />
                <span style={{ fontFamily: 'var(--heading)', fontSize: 40, fontWeight: 800, color: 'var(--accent)', position: 'relative' }}>R</span>
              </div>
              <h3 style={{ fontFamily: 'var(--heading)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                Andrei
              </h3>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>
                {t('about.role')} 🇲🇩
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Kotlin', 'Compose', 'ML Kit', 'MVVM', 'Coroutines'].map(tg => (
                  <span key={tg} className="tag">{tg}</span>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: 16, lineHeight: 1.85, color: 'var(--text-2)', marginBottom: 20 }}>
                {t('about.description')}
              </p>
              <div style={{
                background: 'var(--card)', border: '1px solid var(--line)',
                borderRadius: 12, padding: '18px 22px', marginBottom: 24,
              }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
                  <span style={{ color: 'var(--accent)' }}>{'//'}</span> {t('about.youtubeLabel')}{' '}
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{t('about.youtubeName')}</span>
                  <br />
                  <span style={{ color: 'var(--accent)' }}>{'//'}</span> {t('about.youtubeFocus')}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-alt)' }}>
        <div className="container footer-inner" style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={24} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>{t('footer.copyright')}</span>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>{t('footer.tagline')}</span>
        </div>
      </footer>
    </div>
  );
}
