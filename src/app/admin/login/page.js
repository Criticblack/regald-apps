'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email sau parolă greșită');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 16,
        padding: '48px 40px', width: '100%', maxWidth: 400,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Logo />
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--text)' }}>
              Admin
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Autentificare
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Parolă
            </label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: '#a03020', fontSize: 13, marginBottom: 16, fontFamily: 'var(--sans)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="admin-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Se autentifică...' : 'Intră'}
          </button>
        </form>
      </div>
    </div>
  );
}
