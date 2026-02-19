'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } },
      });
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess('Cont creat! Verifică emailul.');
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError('Email sau parolă incorectă'); setLoading(false); return; }
      onAuth?.(data.user);
      onClose?.();
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google', options: { redirectTo: window.location.href },
    });
    if (error) setError(error.message);
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
        padding: '40px 36px', width: '100%', maxWidth: 400,
      }}>
        <h2 style={{ fontFamily: 'var(--heading)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          {mode === 'login' ? 'Conectează-te' : 'Creează cont'}
        </h2>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 24 }}>
          // pentru a comenta și vota
        </p>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '11px 16px', borderRadius: 10,
          border: '1px solid var(--line)', background: 'transparent',
          fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10, marginBottom: 20, transition: 'border-color 0.2s',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuă cu Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-4)' }}>sau</span>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 12 }}>
              <input className="admin-input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Numele tău" required />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <input type="email" className="admin-input" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input type="password" className="admin-input" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Parolă" required minLength={6} />
          </div>
          {error && <p style={{ color: '#e04040', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          {success && <p style={{ color: '#00d4aa', fontSize: 13, marginBottom: 12 }}>{success}</p>}
          <button type="submit" className="admin-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Așteaptă...' : (mode === 'login' ? 'Intră' : 'Creează cont')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--text-3)' }}>
          {mode === 'login' ? 'Nu ai cont? ' : 'Ai deja cont? '}
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            style={{ color: 'var(--accent)', cursor: 'pointer' }}>
            {mode === 'login' ? 'Înregistrează-te' : 'Conectează-te'}
          </span>
        </p>
      </div>
    </div>
  );
}
