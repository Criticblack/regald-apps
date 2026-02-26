'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import Reveal from '@/components/Reveal';
import Logo from '@/components/Logo';
import { GradientOrbs } from '@/components/Decorations';

function localizedField(field, locale) {
  if (!field) return '';
  if (typeof field === 'object') return field[locale] || field.en || field.ro || '';
  return field;
}

export default function CategoryPage({ category, posts }) {
  const [activeTag, setActiveTag] = useState(null);
  const locale = useLocale();
  const t = useTranslations();
  const tags = [...new Set(posts.flatMap(p => p.tags || []))].sort();
  const filtered = activeTag ? posts.filter(p => p.tags?.includes(activeTag)) : posts;

  const categoryName = localizedField(category.name, locale);
  const categoryDescription = localizedField(category.description, locale);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <GradientOrbs />
      <Navbar />

      <header className="container" style={{ paddingTop: 48, paddingBottom: 8, position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 12, letterSpacing: '0.08em' }}>
            // {category.slug}
          </div>
          <h1 style={{ fontFamily: 'var(--heading)', fontSize: 36, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>
            {categoryName}
          </h1>
          {categoryDescription && (
            <p style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--text-2)', maxWidth: 500 }}>
              {categoryDescription}
            </p>
          )}
        </Reveal>

        {tags.length > 0 && (
          <Reveal delay={0.08}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 24 }}>
              <button className={`filter-btn ${!activeTag ? 'active' : ''}`} onClick={() => setActiveTag(null)}>
                {t('category.allFilter', { count: posts.length })}
              </button>
              {tags.map(tg => (
                <button key={tg} className={`filter-btn ${activeTag === tg ? 'active' : ''}`}
                  onClick={() => setActiveTag(activeTag === tg ? null : tg)}>
                  {tg}
                </button>
              ))}
            </div>
          </Reveal>
        )}
      </header>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ height: 1, background: 'var(--line)', margin: '20px 0 0' }} />
      </div>

      <section className="container" style={{ paddingTop: 32, paddingBottom: 80, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.05}>
              <PostCard post={post} />
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-4)' }}>
                {activeTag ? t('posts.noPostsTag', { tag: activeTag }) : t('posts.noPostsCategory')}
              </p>
            </div>
          )}
        </div>
      </section>

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
