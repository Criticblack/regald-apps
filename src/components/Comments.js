'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations('comments');

  useEffect(() => {
    fetchComments();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription.unsubscribe();
  }, [postId]);

  async function fetchComments() {
    const { data } = await supabase.from('comments')
      .select('*, profiles(display_name, avatar_url)')
      .eq('post_id', postId).order('created_at', { ascending: true });
    setComments(data || []); setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: newComment.trim() });
    setNewComment(''); fetchComments(); setSubmitting(false);
  }

  async function handleDelete(id) {
    if (!confirm(t('deleteConfirm'))) return;
    await supabase.from('comments').delete().eq('id', id);
    setComments(comments.filter(c => c.id !== id));
  }

  function timeAgo(d) {
    const mins = Math.floor((Date.now() - new Date(d)) / 60000);
    if (mins < 1) return t('now');
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
      <h3 style={{ fontFamily: 'var(--heading)', fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 24 }}>
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 400 }}>// </span>
        {t('title')} {comments.length > 0 && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({comments.length})</span>}
      </h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
          placeholder={user ? t('placeholder') : t('placeholderAuth')}
          onClick={() => { if (!user) setShowAuth(true); }}
          maxLength={2000} style={{
            width: '100%', padding: '14px 16px', minHeight: 100,
            border: '1px solid var(--line)', borderRadius: 12,
            fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.6,
            color: 'var(--text)', background: 'var(--card)', outline: 'none',
            resize: 'vertical', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-dim)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-4)' }}>
            {user ? `→ ${user.user_metadata?.full_name || user.email}` : t('authRequired')}
          </span>
          <button type="submit" className="admin-btn" disabled={!user || !newComment.trim() || submitting}
            style={{ padding: '8px 20px', fontSize: 11, opacity: (!user || !newComment.trim()) ? 0.4 : 1 }}>
            {submitting ? '...' : t('send')}
          </button>
        </div>
      </form>

      {loading ? <p style={{ fontFamily: 'var(--mono)', color: 'var(--text-4)' }}>loading...</p> :
        comments.length === 0 ? (
          <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-4)', textAlign: 'center', padding: 32 }}>
            {t('noComments')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map(c => (
              <div key={c.id} style={{
                background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: 'linear-gradient(135deg, var(--line), var(--card))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', overflow: 'hidden',
                    }}>
                      {c.profiles?.avatar_url
                        ? <img src={c.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (c.profiles?.display_name || '?')[0].toUpperCase()
                      }
                    </div>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                      {c.profiles?.display_name || t('anonymous')}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-4)' }}>{timeAgo(c.created_at)}</span>
                  </div>
                  {user?.id === c.user_id && (
                    <button onClick={() => handleDelete(c.id)} style={{
                      background: 'none', border: 'none', fontFamily: 'var(--mono)',
                      fontSize: 10, color: 'var(--text-4)', cursor: 'pointer',
                    }}>×</button>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--sans)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )
      }
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={u => setUser(u)} />}
    </div>
  );
}
