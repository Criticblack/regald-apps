'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABELS = { en: 'EN', ro: 'RO', ru: 'RU' };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {routing.locales.map(loc => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            padding: '4px 8px',
            borderRadius: 4,
            border: '1px solid',
            borderColor: locale === loc ? 'var(--accent)' : 'var(--line)',
            background: locale === loc ? 'var(--accent)' : 'transparent',
            color: locale === loc ? '#0a0b0f' : 'var(--text-3)',
            cursor: 'pointer',
            fontWeight: locale === loc ? 700 : 400,
            transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
