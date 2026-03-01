'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import LanguageTabs from '@/components/LanguageTabs';

function initI18nField(val) {
  if (val && typeof val === 'string' && val.startsWith('{')) {
    try { val = JSON.parse(val); } catch {}
  }
  if (val && typeof val === 'object' && !Array.isArray(val)) return { ro: val.ro || '', en: val.en || '', ru: val.ru || '' };
  return { ro: typeof val === 'string' ? val : '', en: '', ru: '' };
}

function getDisplayName(field) {
  if (!field) return '';
  if (typeof field === 'object') return field.ro || field.en || '';
  return field;
}

const STATUS_LABELS = { done: '✓ Done', in_progress: '◐ In progress', todo: '○ To do' };
const STATUS_COLORS = {
  done: { bg: '#e0f0e0', color: '#2d6a30', border: '#b0d8b0' },
  in_progress: { bg: '#fff3cd', color: '#856404', border: '#eed8a0' },
  todo: { bg: 'var(--tag-bg)', color: 'var(--text-muted)', border: 'var(--border)' },
};

function generateSlug(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminRoadmap() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState({ ro: '', en: '', ru: '' });
  const [newTopicDesc, setNewTopicDesc] = useState({ ro: '', en: '', ru: '' });
  const [newTopicSlug, setNewTopicSlug] = useState('');
  const [newItems, setNewItems] = useState({}); // { topicId: { ro: '', en: '', ru: '' } }
  const [activeLang, setActiveLang] = useState('ro');
  const [itemLangs, setItemLangs] = useState({}); // { topicId: 'ro' }
  const [policyOpen, setPolicyOpen] = useState(null); // topicId or null
  const [policyLangs, setPolicyLangs] = useState({}); // { topicId: 'ro' }
  const [policyEdits, setPolicyEdits] = useState({}); // { topicId: { ro, en, ru } }
  const [storeUrls, setStoreUrls] = useState({}); // { topicId: 'url' }
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin/login');
    });
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: topicsData } = await supabase
      .from('roadmap_topics')
      .select('*, roadmap_items(*)')
      .order('sort_order');

    if (topicsData) {
      topicsData.forEach(t => {
        t.roadmap_items?.sort((a, b) => a.sort_order - b.sort_order);
      });
    }
    setTopics(topicsData || []);
    setLoading(false);
  }

  async function addTopic(e) {
    e.preventDefault();
    if (!newTopic.ro.trim() && !newTopic.en.trim()) return;
    const descObj = (newTopicDesc.ro || newTopicDesc.en || newTopicDesc.ru)
      ? { ro: newTopicDesc.ro.trim(), en: newTopicDesc.en.trim(), ru: newTopicDesc.ru.trim() }
      : null;
    const slug = newTopicSlug.trim() || generateSlug(newTopic.en || newTopic.ro);
    await supabase.from('roadmap_topics').insert({
      title: { ro: newTopic.ro.trim(), en: newTopic.en.trim(), ru: newTopic.ru.trim() },
      description: descObj,
      slug: slug || null,
      sort_order: topics.length + 1,
    });
    setNewTopic({ ro: '', en: '', ru: '' });
    setNewTopicDesc({ ro: '', en: '', ru: '' });
    setNewTopicSlug('');
    fetchAll();
  }

  async function savePolicy(topicId) {
    const edits = policyEdits[topicId];
    if (!edits) return;
    const policyObj = { ro: edits.ro || '', en: edits.en || '', ru: edits.ru || '' };
    await supabase.from('roadmap_topics').update({ privacy_policy: policyObj }).eq('id', topicId);
    fetchAll();
  }

  async function saveStoreUrl(topicId) {
    const url = storeUrls[topicId] ?? '';
    await supabase.from('roadmap_topics').update({ play_store_url: url.trim() || null }).eq('id', topicId);
    fetchAll();
  }

  async function deleteTopic(id) {
    if (!confirm('Ștergi acest topic și toate itemele lui?')) return;
    await supabase.from('roadmap_topics').delete().eq('id', id);
    fetchAll();
  }

  async function addItem(topicId) {
    const itemVal = newItems[topicId] || { ro: '', en: '', ru: '' };
    if (!itemVal.ro?.trim() && !itemVal.en?.trim()) return;
    const count = topics.find(t => t.id === topicId)?.roadmap_items?.length || 0;
    await supabase.from('roadmap_items').insert({
      topic_id: topicId,
      title: { ro: itemVal.ro?.trim() || '', en: itemVal.en?.trim() || '', ru: itemVal.ru?.trim() || '' },
      status: 'todo',
      sort_order: count + 1,
    });
    setNewItems({ ...newItems, [topicId]: { ro: '', en: '', ru: '' } });
    fetchAll();
  }

  async function updateItemStatus(itemId, status) {
    await supabase.from('roadmap_items').update({ status }).eq('id', itemId);
    fetchAll();
  }

  async function deleteItem(itemId) {
    await supabase.from('roadmap_items').delete().eq('id', itemId);
    fetchAll();
  }

  function getProgress(items) {
    if (!items?.length) return 0;
    const done = items.filter(i => i.status === 'done').length;
    const inProg = items.filter(i => i.status === 'in_progress').length;
    return Math.round(((done + inProg * 0.5) / items.length) * 100);
  }

  function getItemLang(topicId) {
    return itemLangs[topicId] || 'ro';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        borderBottom: '1.5px solid var(--border)', background: 'var(--card)',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>ROADMAP</span>
        </div>
        <Link href="/admin" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 32 }}>
          Roadmap
        </h1>

        {/* Add topic */}
        <form onSubmit={addTopic} style={{
          background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12,
          padding: '20px', marginBottom: 32,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            ADAUGĂ TOPIC NOU
          </div>
          <LanguageTabs activeLang={activeLang} onSwitch={setActiveLang} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <input className="admin-input" value={newTopic[activeLang]}
              onChange={e => {
                const val = e.target.value;
                setNewTopic({ ...newTopic, [activeLang]: val });
                if (activeLang === 'en' && !newTopicSlug) setNewTopicSlug(generateSlug(val));
              }}
              placeholder={`Titlu topic (${activeLang.toUpperCase()})`} style={{ flex: 1 }} />
            <input className="admin-input" value={newTopicDesc[activeLang]}
              onChange={e => setNewTopicDesc({ ...newTopicDesc, [activeLang]: e.target.value })}
              placeholder={`Descriere (${activeLang.toUpperCase()}, opțional)`} style={{ flex: 1.5 }} />
            <button type="submit" className="admin-btn" style={{ padding: '10px 20px', fontSize: 11 }}>+ Adaugă</button>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input className="admin-input" value={newTopicSlug}
              onChange={e => setNewTopicSlug(e.target.value)}
              placeholder="slug (ex: fitness-tracker-pro)" style={{ flex: 1, fontSize: 11 }} />
            {newTopicSlug && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                /privacy/{newTopicSlug}
              </span>
            )}
          </div>
        </form>

        {/* Topics */}
        {topics.map(topic => {
          const progress = getProgress(topic.roadmap_items);
          const iLang = getItemLang(topic.id);
          return (
            <div key={topic.id} style={{
              background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 14,
              padding: '24px', marginBottom: 16,
            }}>
              {/* Topic header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
                    {getDisplayName(topic.title)}
                  </h3>
                  {topic.description && (
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-3)' }}>{getDisplayName(topic.description)}</p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: progress === 100 ? '#2d6a30' : 'var(--accent)' }}>
                    {progress}%
                  </span>
                  <button onClick={() => deleteTopic(topic.id)} className="admin-btn admin-btn-danger" style={{ padding: '4px 10px', fontSize: 9 }}>
                    Șterge
                  </button>
                </div>
              </div>

              {/* Slug */}
              {topic.slug && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
                  /privacy/{topic.slug}
                </div>
              )}

              {/* Play Store URL */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <input className="admin-input"
                  value={storeUrls[topic.id] ?? topic.play_store_url ?? ''}
                  onChange={e => setStoreUrls({ ...storeUrls, [topic.id]: e.target.value })}
                  placeholder="Play Store URL (ex: https://play.google.com/store/apps/details?id=...)"
                  style={{ flex: 1, fontSize: 11, padding: '6px 10px' }} />
                <button type="button" onClick={() => saveStoreUrl(topic.id)}
                  className="admin-btn admin-btn-outline" style={{ padding: '5px 14px', fontSize: 10, flexShrink: 0 }}>
                  Save URL
                </button>
              </div>

              {/* Privacy Policy Editor */}
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (policyOpen === topic.id) {
                      setPolicyOpen(null);
                    } else {
                      setPolicyOpen(topic.id);
                      if (!policyEdits[topic.id]) {
                        setPolicyEdits({ ...policyEdits, [topic.id]: initI18nField(topic.privacy_policy) });
                      }
                    }
                  }}
                  className="admin-btn admin-btn-outline"
                  style={{ padding: '5px 14px', fontSize: 10 }}
                >
                  {policyOpen === topic.id ? '▾ Privacy Policy' : '▸ Privacy Policy'}
                </button>

                {policyOpen === topic.id && (
                  <div style={{ marginTop: 12, padding: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <LanguageTabs
                      activeLang={policyLangs[topic.id] || 'ro'}
                      onSwitch={l => setPolicyLangs({ ...policyLangs, [topic.id]: l })}
                    />
                    <textarea
                      className="admin-input"
                      value={(policyEdits[topic.id] || {})[policyLangs[topic.id] || 'ro'] || ''}
                      onChange={e => setPolicyEdits({
                        ...policyEdits,
                        [topic.id]: { ...(policyEdits[topic.id] || { ro: '', en: '', ru: '' }), [policyLangs[topic.id] || 'ro']: e.target.value }
                      })}
                      placeholder={`Privacy policy markdown (${(policyLangs[topic.id] || 'ro').toUpperCase()})`}
                      style={{ width: '100%', minHeight: 200, fontFamily: 'var(--mono)', fontSize: 12, resize: 'vertical', padding: 12 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button type="button" onClick={() => savePolicy(topic.id)} className="admin-btn" style={{ padding: '8px 20px', fontSize: 11 }}>
                        Salvează Policy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6, borderRadius: 3, background: 'var(--border-light)', marginBottom: 16, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3, width: `${progress}%`,
                  background: progress === 100 ? '#2d6a30' : 'var(--accent)',
                  transition: 'width 0.5s ease',
                }} />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topic.roadmap_items?.map(item => {
                  const sc = STATUS_COLORS[item.status];
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8,
                      background: item.status === 'done' ? '#033303' : 'transparent',
                    }}>
                      <button onClick={() => {
                        const next = item.status === 'todo' ? 'in_progress' : item.status === 'in_progress' ? 'done' : 'todo';
                        updateItemStatus(item.id, next);
                      }} style={{
                        background: sc.bg, border: `1.5px solid ${sc.border}`, borderRadius: 6,
                        padding: '3px 10px', fontFamily: 'var(--mono)', fontSize: 9,
                        color: sc.color, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                      }}>
                        {STATUS_LABELS[item.status]}
                      </button>

                      <span style={{
                        fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)',
                        flex: 1, textDecoration: item.status === 'done' ? 'line-through' : 'none',
                        opacity: item.status === 'done' ? 0.6 : 1,
                      }}>
                        {getDisplayName(item.title)}
                      </span>

                      <button onClick={() => deleteItem(item.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-light)', fontSize: 14, transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.target.style.color = '#a03020'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-light)'}
                      >×</button>
                    </div>
                  );
                })}
              </div>

              {/* Add item */}
              <div style={{ marginTop: 12 }}>
                <LanguageTabs activeLang={iLang} onSwitch={l => setItemLangs({ ...itemLangs, [topic.id]: l })} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="admin-input"
                    value={(newItems[topic.id] || {})[iLang] || ''}
                    onChange={e => setNewItems({
                      ...newItems,
                      [topic.id]: { ...(newItems[topic.id] || { ro: '', en: '', ru: '' }), [iLang]: e.target.value }
                    })}
                    placeholder={`Adaugă item (${iLang.toUpperCase()})`}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(topic.id); } }}
                    style={{ flex: 1, padding: '8px 12px', fontSize: 12 }} />
                  <button type="button" onClick={() => addItem(topic.id)}
                    className="admin-btn admin-btn-outline" style={{ padding: '8px 14px', fontSize: 10 }}>
                    + Item
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
