'use client';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import VideoPlayer from './VideoPlayer';

import { localizedField } from '@/lib/localize';

const LOCALE_MAP = { en: 'en-US', ro: 'ro-RO', ru: 'ru-RU' };

export default function PostCard({ post }) {
  const locale = useLocale();
  const t = useTranslations('posts');
  const isVideo = post.type === 'video';
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString(LOCALE_MAP[locale] || 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : '';

  const title = localizedField(post.title, locale);
  const description = localizedField(post.description, locale);

  return (
    <Link href={`/post/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="post-card" style={{
        ...(isVideo
          ? { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 28, padding: '24px 24px 24px 28px', alignItems: 'center' }
          : { padding: '28px 32px' }
        ),
      }}>
        {/* Accent line */}
        <div className="accent-line" style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
          background: 'transparent', transition: 'background 0.3s',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className={isVideo ? 'badge badge-video' : 'badge badge-text'}>
              {isVideo ? `▶ ${t('badgeStream')}` : `</> ${t('badgeText')}`}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>
              {date}
            </span>
            {post.duration && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>
                · {post.duration}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="post-title" style={{
            fontFamily: 'var(--heading)', fontSize: isVideo ? 22 : 20,
            fontWeight: 600, lineHeight: 1.3, color: 'var(--text)',
            marginBottom: 10, transition: 'color 0.25s', letterSpacing: '-0.02em',
            maxWidth: isVideo ? 400 : 650,
          }}>{title}</h3>

          {/* Description */}
          {description && (
            <p style={{
              fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.7,
              color: 'var(--text-2)', maxWidth: isVideo ? 400 : 650,
            }}>{description}</p>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
              {post.tags.map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}
        </div>

        {isVideo && post.youtube_url && (
          <div style={{ position: 'relative', zIndex: 1 }}
            onClick={e => e.preventDefault()}>
            <VideoPlayer youtubeUrl={post.youtube_url} duration={post.duration} />
          </div>
        )}
      </div>
    </Link>
  );
}
