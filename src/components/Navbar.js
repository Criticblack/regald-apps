'use client';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

import { localizedField } from '@/lib/localize';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    supabase.from('categories').select('name, slug').order('sort_order')
      .then(({ data }) => setCategories(data || []));
  }, []);

  const navItems = [
    { label: t('home'), href: '/' },
    ...categories.map(c => ({ label: localizedField(c.name, locale), href: `/${c.slug}` })),
    { label: t('roadmap'), href: '/roadmap' },
    { label: t('about'), href: '/#despre' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'var(--nav-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      transition: 'all 0.35s',
    }}>
      <div className="container" style={{
        padding: '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <Logo />
          <div>
            <div style={{
              fontFamily: 'var(--heading)', fontSize: 17, fontWeight: 700,
              color: 'var(--text)', letterSpacing: '-0.02em',
            }}>
              regald<span style={{ color: 'var(--accent)' }}>.</span>apps
            </div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--text-3)', marginTop: -1,
            }}>building in public</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="nav-items" style={{ display: 'flex', gap: 22 }}>
            {navItems.map(item => {
              const active = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href.replace('/#', '/'));
              return (
                <Link key={item.href} href={item.href}
                  className={`nav-link ${active ? 'active' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
