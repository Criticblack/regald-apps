'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockReason, setBlockReason] = useState('');
  const [blockingId, setBlockingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin/login');
    });
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function handleBlock(userId) {
    await supabase.from('profiles').update({
      is_blocked: true,
      blocked_reason: blockReason || 'Blocat de admin',
      blocked_at: new Date().toISOString(),
    }).eq('id', userId);
    setBlockingId(null);
    setBlockReason('');
    fetchUsers();
  }

  async function handleUnblock(userId) {
    await supabase.from('profiles').update({
      is_blocked: false, blocked_reason: null, blocked_at: null,
    }).eq('id', userId);
    fetchUsers();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        borderBottom: '1.5px solid var(--border)', background: 'var(--card)',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>UTILIZATORI</span>
        </div>
        <Link href="/admin" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>Utilizatori</h1>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>
          {users.length} utilizatori · {users.filter(u => u.is_blocked).length} blocați — Utilizatorii blocați nu pot comenta sau vota.
        </p>

        {loading ? (
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text-muted)' }}>Se încarcă...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(user => (
              <div key={user.id} style={{
                background: user.is_blocked ? '#fdf2f2' : '#fff',
                border: `1.5px solid ${user.is_blocked ? '#e8c0c0' : 'var(--border)'}`,
                borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--border), var(--border-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--text-3)',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (user.display_name || '?')[0].toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {user.display_name || 'Fără nume'}
                    </span>
                    {user.is_admin && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 8px', borderRadius: 4, background: '#e0f0e0', color: '#2d6a30', textTransform: 'uppercase' }}>Admin</span>}
                    {user.is_blocked && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 8px', borderRadius: 4, background: '#f8d0d0', color: '#a03020', textTransform: 'uppercase' }}>Blocat</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-light)', marginTop: 2 }}>
                    {user.id.slice(0, 8)}...
                    {user.blocked_reason && <span style={{ color: '#a03020', marginLeft: 8 }}>Motiv: {user.blocked_reason}</span>}
                  </div>
                </div>
                {!user.is_admin && (
                  <div style={{ flexShrink: 0 }}>
                    {user.is_blocked ? (
                      <button onClick={() => handleUnblock(user.id)} className="admin-btn admin-btn-outline" style={{ padding: '6px 14px', fontSize: 10 }}>Deblochează</button>
                    ) : blockingId === user.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input className="admin-input" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                          placeholder="Motiv (opțional)" style={{ width: 160, padding: '6px 10px', fontSize: 11 }} />
                        <button onClick={() => handleBlock(user.id)} className="admin-btn admin-btn-danger" style={{ padding: '6px 12px', fontSize: 10 }}>Confirmă</button>
                        <button onClick={() => { setBlockingId(null); setBlockReason(''); }} className="admin-btn admin-btn-outline" style={{ padding: '6px 12px', fontSize: 10 }}>×</button>
                      </div>
                    ) : (
                      <button onClick={() => setBlockingId(user.id)} className="admin-btn admin-btn-danger" style={{ padding: '6px 14px', fontSize: 10 }}>Blochează</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
