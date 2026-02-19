'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

const STATUS_LABELS = { done: '✓ Done', in_progress: '◐ In progress', todo: '○ To do' };
const STATUS_COLORS = {
  done: { bg: '#e0f0e0', color: '#2d6a30', border: '#b0d8b0' },
  in_progress: { bg: '#fff3cd', color: '#856404', border: '#eed8a0' },
  todo: { bg: 'var(--tag-bg)', color: 'var(--text-muted)', border: 'var(--border)' },
};

export default function AdminRoadmap() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newItems, setNewItems] = useState({}); // { topicId: 'new item text' }
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
    if (!newTopic.trim()) return;
    await supabase.from('roadmap_topics').insert({
      title: newTopic.trim(),
      description: newTopicDesc.trim() || null,
      sort_order: topics.length + 1,
    });
    setNewTopic('');
    setNewTopicDesc('');
    fetchAll();
  }

  async function deleteTopic(id) {
    if (!confirm('Ștergi acest topic și toate itemele lui?')) return;
    await supabase.from('roadmap_topics').delete().eq('id', id);
    fetchAll();
  }

  async function addItem(topicId) {
    const text = newItems[topicId]?.trim();
    if (!text) return;
    const count = topics.find(t => t.id === topicId)?.roadmap_items?.length || 0;
    await supabase.from('roadmap_items').insert({
      topic_id: topicId, title: text, status: 'todo', sort_order: count + 1,
    });
    setNewItems({ ...newItems, [topicId]: '' });
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
          Roadmap Filosofie
        </h1>

        {/* Add topic */}
        <form onSubmit={addTopic} style={{
          background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12,
          padding: '20px', marginBottom: 32,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            ADAUGĂ TOPIC NOU
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="admin-input" value={newTopic} onChange={e => setNewTopic(e.target.value)}
              placeholder="Ex: Filosofia Orientală" style={{ flex: 1 }} />
            <input className="admin-input" value={newTopicDesc} onChange={e => setNewTopicDesc(e.target.value)}
              placeholder="Descriere (opțional)" style={{ flex: 1.5 }} />
            <button type="submit" className="admin-btn" style={{ padding: '10px 20px', fontSize: 11 }}>+ Adaugă</button>
          </div>
        </form>

        {/* Topics */}
        {topics.map(topic => {
          const progress = getProgress(topic.roadmap_items);
          return (
            <div key={topic.id} style={{
              background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 14,
              padding: '24px', marginBottom: 16,
            }}>
              {/* Topic header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
                    {topic.title}
                  </h3>
                  {topic.description && (
                    <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-3)' }}>{topic.description}</p>
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
                      {/* Status cycle button */}
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
                        {item.title}
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
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input className="admin-input" value={newItems[topic.id] || ''}
                  onChange={e => setNewItems({ ...newItems, [topic.id]: e.target.value })}
                  placeholder="Adaugă item (ex: Aristotel — Poetica)"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(topic.id); } }}
                  style={{ flex: 1, padding: '8px 12px', fontSize: 12 }} />
                <button type="button" onClick={() => addItem(topic.id)}
                  className="admin-btn admin-btn-outline" style={{ padding: '8px 14px', fontSize: 10 }}>
                  + Item
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
