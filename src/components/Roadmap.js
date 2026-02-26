'use client';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { GridBg } from './Decorations';
import Reveal from './Reveal';

function localizedField(field, locale) {
  if (!field) return '';
  if (typeof field === 'object') return field[locale] || field.en || field.ro || '';
  return field;
}

export default function Roadmap({ embedded = false }) {
  const [topics, setTopics] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const locale = useLocale();
  const t = useTranslations('roadmap');

  const STATUS = {
    done: { icon: '✓', color: '#68c868', label: t('statusShipped') },
    in_progress: { icon: '●', color: 'var(--accent)', label: t('statusBuilding') },
    todo: { icon: '○', color: 'var(--text-4)', label: t('statusPlanned') },
  };

  useEffect(() => {
    supabase.from('roadmap_topics').select('*, roadmap_items(*)').order('sort_order')
      .then(({ data }) => {
        if (data) data.forEach(t => t.roadmap_items?.sort((a, b) => a.sort_order - b.sort_order));
        setTopics(data || []);
      });
  }, []);

  if (!topics.length) return null;

  function progress(items) {
    if (!items?.length) return 0;
    const d = items.filter(i => i.status === 'done').length;
    const p = items.filter(i => i.status === 'in_progress').length;
    return Math.round(((d + p * 0.5) / items.length) * 100);
  }

  function current(items) { return items?.find(i => i.status === 'in_progress'); }

  const Wrapper = embedded ? 'section' : 'div';

  return (
    <Wrapper style={{
      ...(embedded ? { background: 'var(--bg-alt)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', position: 'relative' } : {}),
    }}>
      {embedded && <GridBg opacity={0.03} />}
      <div className="container" style={{ padding: embedded ? '56px 40px' : '0', position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 8, letterSpacing: '0.08em' }}>
              {t('comment')}
            </div>
            <h2 style={{ fontFamily: 'var(--heading)', fontSize: 28, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {t('title')}
            </h2>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-2)' }}>
              {t('description')}
            </p>
          </div>
        </Reveal>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {topics.map((topic, idx) => {
            const pct = progress(topic.roadmap_items);
            const cur = current(topic.roadmap_items);
            const isOpen = expanded === topic.id;
            const status = pct === 100 ? 'done' : pct > 0 ? 'in_progress' : 'todo';

            return (
              <Reveal key={topic.id} delay={idx * 0.06}>
                <div
                  onClick={() => setExpanded(isOpen ? null : topic.id)}
                  style={{
                    background: 'var(--card)', border: '1px solid var(--line)',
                    borderRadius: 14, padding: '24px 26px', cursor: 'pointer',
                    position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--heading)', fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                        {localizedField(topic.title, locale)}
                      </h3>
                      {topic.description && (
                        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-3)' }}>{localizedField(topic.description, locale)}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 10px', borderRadius: 6,
                        background: STATUS[status].color === 'var(--text-4)' ? 'rgba(255,255,255,0.04)' : `${STATUS[status].color}15`,
                        color: STATUS[status].color,
                        border: `1px solid ${STATUS[status].color}30`,
                      }}>
                        {STATUS[status].icon} {STATUS[status].label}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isOpen ? 16 : 0 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, width: `${pct}%`,
                        background: pct === 100 ? 'linear-gradient(90deg, #68c868, #4aa84a)' : 'linear-gradient(90deg, var(--accent), #00a888)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'right',
                      color: pct === 100 ? '#68c868' : 'var(--accent)',
                    }}>{pct}%</span>
                  </div>

                  {cur && !isOpen && (
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
                      → <span style={{ color: 'var(--accent)' }}>{localizedField(cur.title, locale)}</span>
                    </p>
                  )}

                  {/* Expanded */}
                  {isOpen && (
                    <div onClick={e => e.stopPropagation()} style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {topic.roadmap_items?.map(item => {
                          const s = STATUS[item.status];
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
                              <span style={{
                                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                                border: item.status === 'done' ? 'none' : `1.5px solid ${s.color}`,
                                background: item.status === 'done' ? 'var(--accent)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, color: '#0a0b0f',
                              }}>
                                {item.status === 'done' && '✓'}
                              </span>
                              <span style={{
                                fontFamily: 'var(--sans)', fontSize: 13,
                                color: item.status === 'done' ? 'var(--text-3)' : 'var(--text)',
                                textDecoration: item.status === 'done' ? 'line-through' : 'none',
                                opacity: item.status === 'done' ? 0.6 : 1,
                              }}>{localizedField(item.title, locale)}</span>
                              {item.status === 'in_progress' && (
                                <span style={{
                                  fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 8px', borderRadius: 4,
                                  background: 'rgba(0,212,170,0.1)', color: 'var(--accent)', marginLeft: 'auto',
                                }}>{t('inProgress')}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
}
