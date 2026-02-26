'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }
    setUser(user);
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  async function deletePost(id) {
    if (!confirm('Sigur vrei să ștergi această postare?')) return;
    await supabase.from('posts').delete().eq('id', id);
    setPosts(posts.filter(p => p.id !== id));
  }

  async function toggleDraft(post) {
    const { data } = await supabase
      .from('posts')
      .update({ draft: !post.draft })
      .eq('id', post.id)
      .select()
      .single();
    if (data) {
      setPosts(posts.map(p => p.id === post.id ? data : p));
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Admin nav */}
      <nav style={{
        borderBottom: '1.5px solid var(--border)', background: 'var(--card)',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            ADMIN PANEL
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/categories" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            Categorii
          </Link>
          <Link href="/admin/tags" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            Tag-uri
          </Link>
          <Link href="/admin/users" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            Utilizatori
          </Link>
          <Link href="/admin/roadmap" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            Roadmap
          </Link>
          <Link href="/" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            ← Vezi blogul
          </Link>
          <button onClick={handleLogout} className="admin-btn admin-btn-outline" style={{ padding: '6px 14px', fontSize: 11 }}>
            Deconectare
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>
              Postări
            </h1>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {posts.length} postări total · {posts.filter(p => p.draft).length} draft-uri
            </p>
          </div>
          <Link href="/admin/new" className="admin-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            + Postare nouă
          </Link>
        </div>

        {/* Posts list */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            Se încarcă...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map(post => (
              <div key={post.id} style={{
                background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 12,
                padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color 0.2s',
              }}>
                {/* Type badge */}
                <span className={`badge ${post.type === 'video' ? 'badge-video' : 'badge-text'}`}>
                  {post.type === 'video' ? '▶' : '✍'}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <h3 style={{
                      fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400,
                      color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {typeof post.title === 'object' ? (post.title.ro || post.title.en || '') : post.title}
                    </h3>
                    {post.draft && (
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 8px',
                        borderRadius: 4, background: '#fff3cd', color: '#856404',
                        letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
                      }}>Draft</span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-light)',
                    display: 'flex', gap: 8,
                  }}>
                    <span>{post.slug}</span>
                    <span>·</span>
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleDraft(post)}
                    className="admin-btn admin-btn-outline"
                    style={{ padding: '6px 12px', fontSize: 10 }}
                  >
                    {post.draft ? 'Publică' : 'Draft'}
                  </button>
                  <Link
                    href={`/admin/edit/${post.id}`}
                    className="admin-btn admin-btn-outline"
                    style={{ padding: '6px 12px', fontSize: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    Editează
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: '6px 12px', fontSize: 10 }}
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div style={{
                textAlign: 'center', padding: 60, color: 'var(--text-muted)',
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16,
              }}>
                Nicio postare încă. Creează prima ta postare!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ro-RO', { year: 'numeric', month: 'short', day: 'numeric' });
}
