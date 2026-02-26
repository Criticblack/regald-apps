'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';

export default function Rating({ postId }) {
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const t = useTranslations('rating');

  useEffect(() => {
    fetchRatings();
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); if (user) fetchUserRating(user.id); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user || null); if (s?.user) fetchUserRating(s.user.id);
    });
    return () => subscription.unsubscribe();
  }, [postId]);

  async function fetchRatings() {
    const { data } = await supabase.from('ratings').select('value').eq('post_id', postId);
    if (data?.length) { setAvg(data.reduce((s, r) => s + r.value, 0) / data.length); setTotal(data.length); }
  }

  async function fetchUserRating(uid) {
    const { data } = await supabase.from('ratings').select('value').eq('post_id', postId).eq('user_id', uid).maybeSingle();
    if (data) setUserRating(data.value);
  }

  async function handleRate(v) {
    if (!user) { setShowAuth(true); return; }
    if (userRating) { await supabase.from('ratings').update({ value: v }).eq('post_id', postId).eq('user_id', user.id); }
    else { await supabase.from('ratings').insert({ post_id: postId, user_id: user.id, value: v }); }
    setUserRating(v); fetchRatings();
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderTop: '1px solid var(--line)', marginTop: 24 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => handleRate(s)}
            onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 20,
              transition: 'transform 0.15s', transform: hover === s ? 'scale(1.2)' : 'scale(1)',
              color: s <= (hover || userRating || Math.round(avg)) ? 'var(--accent)' : 'var(--text-4)',
            }}>★</button>
        ))}
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
        {avg > 0 ? avg.toFixed(1) : '—'}
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-4)' }}>
        {total > 0 ? `(${total})` : t('noVotes')}
      </span>
      {userRating > 0 && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '3px 8px', borderRadius: 4 }}>
          ★{userRating}
        </span>
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={u => setUser(u)} />}
    </div>
  );
}
