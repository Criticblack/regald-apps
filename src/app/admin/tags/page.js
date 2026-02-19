'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin/login');
    });
    fetchTags();
  }, []);

  async function fetchTags() {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    setTags(data || []);
    setLoading(false);
  }

  function toSlug(text) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleAdd(e) {
    e.preventDefault();
    const name = newTag.trim().toLowerCase();
    if (!name) return;
    const { error } = await supabase.from('tags').insert({ name, slug: toSlug(name) });
    if (error) {
      if (error.code === '23505') alert('Acest tag există deja!');
      else alert('Eroare: ' + error.message);
      return;
    }
    setNewTag('');
    fetchTags();
  }

  async function handleDelete(id) {
    if (!confirm('Ștergi acest tag?')) return;
    await supabase.from('tags').delete().eq('id', id);
    fetchTags();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        borderBottom: '1.5px solid var(--border)', background: 'var(--card)',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>TAG-URI</span>
        </div>
        <Link href="/admin" style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none',
        }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
          Tag-uri
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>
          Gestionează tag-urile disponibile. Le poți selecta apoi când creezi o postare.
        </p>

        {/* Add new */}
        <form onSubmit={handleAdd} style={{
          display: 'flex', gap: 10, marginBottom: 32,
        }}>
          <input
            className="admin-input"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Tag nou (ex: stoicism)"
            style={{ flex: 1 }}
          />
          <button type="submit" className="admin-btn" style={{ padding: '10px 20px', fontSize: 11, flexShrink: 0 }}>
            + Adaugă
          </button>
        </form>

        {/* Tags grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.map(tag => (
            <div key={tag.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 20,
              padding: '6px 8px 6px 14px', transition: 'border-color 0.2s',
            }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-2)' }}>
                #{tag.name}
              </span>
              <button onClick={() => handleDelete(tag.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-light)', fontSize: 16, lineHeight: 1,
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.background = '#fde8e8'; e.target.style.color = '#a03020'; }}
              onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--text-light)'; }}
              >×</button>
            </div>
          ))}

          {tags.length === 0 && !loading && (
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text-muted)', padding: 20 }}>
              Niciun tag încă. Adaugă primul tag mai sus.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
