'use client';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Roadmap from '@/components/Roadmap';
import Logo from '@/components/Logo';
import { GradientOrbs } from '@/components/Decorations';

export default function RoadmapView() {
  const t = useTranslations();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <GradientOrbs />
      <Navbar />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 32, paddingBottom: 64 }}>
        <Roadmap />
      </div>
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
