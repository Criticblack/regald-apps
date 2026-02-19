'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin/login');
    });
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  }

  function toSlug(text) {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const slug = toSlug(newName);
    const { error } = await supabase.from('categories').insert({
      name: newName.trim(),
      slug,
      description: newDesc.trim() || null,
      sort_order: categories.length + 1,
    });
    if (error) { alert('Eroare: ' + error.message); return; }
    setNewName('');
    setNewDesc('');
    fetchCategories();
  }

  async function handleUpdate(cat) {
    const { error } = await supabase.from('categories').update({
      name: cat.name,
      description: cat.description,
    }).eq('id', cat.id);
    if (error) { alert('Eroare: ' + error.message); return; }
    setEditing(null);
    fetchCategories();
  }

  async function handleDelete(id) {
    if (!confirm('Sigur vrei să ștergi această categorie? Postările din ea vor rămâne fără categorie.')) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        borderBottom: '1.5px solid var(--border)', background: 'var(--card)',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>CATEGORII</span>
        </div>
        <Link href="/admin" style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none',
        }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
          Categorii
        </h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>
          Gestionează categoriile blogului. Fiecare categorie devine o pagină separată în navigare.
        </p>

        {/* Add new */}
        <form onSubmit={handleAdd} style={{
          background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12,
          padding: '24px', marginBottom: 24,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.08em' }}>
            ADAUGĂ CATEGORIE NOUĂ
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input
              className="admin-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nume (ex: Recenzii)"
              required
              style={{ flex: 1 }}
            />
            <input
              className="admin-input"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Descriere scurtă (opțional)"
              style={{ flex: 1.5 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-light)' }}>
              Slug: /{toSlug(newName) || '...'}
            </span>
            <button type="submit" className="admin-btn" style={{ padding: '8px 20px', fontSize: 11 }}>
              + Adaugă
            </button>
          </div>
        </form>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((cat, i) => (
            <div key={cat.id} style={{
              background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12,
              padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-light)',
                minWidth: 24,
              }}>
                {i + 1}.
              </span>

              {editing === cat.id ? (
                <div style={{ flex: 1, display: 'flex', gap: 10 }}>
                  <input className="admin-input" value={cat.name}
                    onChange={e => setCategories(categories.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c))}
                    style={{ flex: 1 }} />
                  <input className="admin-input" value={cat.description || ''}
                    onChange={e => setCategories(categories.map(c => c.id === cat.id ? { ...c, description: e.target.value } : c))}
                    style={{ flex: 1.5 }} placeholder="Descriere" />
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--text)' }}>
                    {cat.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-light)', marginLeft: 10,
                  }}>
                    /{cat.slug}
                  </span>
                  {cat.description && (
                    <span style={{
                      fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--text-muted)', marginLeft: 10,
                    }}>
                      — {cat.description}
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {editing === cat.id ? (
                  <>
                    <button onClick={() => handleUpdate(cat)} className="admin-btn" style={{ padding: '5px 12px', fontSize: 10 }}>
                      Salvează
                    </button>
                    <button onClick={() => { setEditing(null); fetchCategories(); }} className="admin-btn admin-btn-outline" style={{ padding: '5px 12px', fontSize: 10 }}>
                      Anulează
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditing(cat.id)} className="admin-btn admin-btn-outline" style={{ padding: '5px 12px', fontSize: 10 }}>
                      Editează
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="admin-btn admin-btn-danger" style={{ padding: '5px 12px', fontSize: 10 }}>
                      Șterge
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
