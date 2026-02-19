'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function PostEditor({ initialData = null }) {
  const isEdit = !!initialData;
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [type, setType] = useState(initialData?.type || 'text');
  const [youtubeUrl, setYoutubeUrl] = useState(initialData?.youtube_url || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [selectedTags, setSelectedTags] = useState(initialData?.tags || []);
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [draft, setDraft] = useState(initialData?.draft ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories and tags from DB
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data || []);
      // Set default category if creating new post
      if (!isEdit && data?.length > 0 && !categoryId) {
        setCategoryId(data[0].id);
      }
    });
    supabase.from('tags').select('*').order('name').then(({ data }) => {
      setAllTags(data || []);
    });
  }, []);

  function handleTitleChange(val) {
    setTitle(val);
    if (!isEdit) {
      setSlug(val.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      );
    }
  }

  function toggleTag(tagName) {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  }

  async function handleAddNewTag(e) {
    e.preventDefault();
    const name = newTagInput.trim().toLowerCase();
    if (!name) return;
    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data, error } = await supabase.from('tags').insert({ name, slug }).select().single();
    if (error) {
      if (error.code === '23505') {
        // Already exists, just select it
        if (!selectedTags.includes(name)) setSelectedTags([...selectedTags, name]);
      }
    } else {
      setAllTags([...allTags, data].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedTags([...selectedTags, name]);
    }
    setNewTagInput('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const postData = {
      title, slug, description, content, type,
      youtube_url: type === 'video' ? youtubeUrl : null,
      duration: type === 'video' ? duration : null,
      tags: selectedTags,
      category_id: categoryId || null,
      draft,
      published_at: initialData?.published_at || new Date().toISOString(),
    };

    let result;
    if (isEdit) {
      result = await supabase.from('posts').update(postData).eq('id', initialData.id);
    } else {
      result = await supabase.from('posts').insert(postData);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
    } else {
      router.push('/admin');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        borderBottom: '1.5px solid var(--border)', background: 'var(--card)',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={32} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            {isEdit ? 'EDITEAZĂ POSTARE' : 'POSTARE NOUĂ'}
          </span>
        </div>
        <Link href="/admin" style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none',
        }}>← Dashboard</Link>
      </nav>

      <form onSubmit={handleSave} style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>

        {/* Type + Category row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Tip postare
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['text', 'video'].map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`filter-btn ${type === t ? 'active' : ''}`}>
                  {t === 'video' ? '▶ Video' : '✍ Text'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Categorie
            </label>
            <select
              className="admin-input"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">— Fără categorie —</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Titlu
          </label>
          <input className="admin-input" value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Titlul postării" required
            style={{ fontFamily: 'var(--serif)', fontSize: 20 }} />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Slug (URL)
          </label>
          <input className="admin-input" value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="titlul-postarii" required
            style={{ fontFamily: 'var(--mono)', fontSize: 13 }} />
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-light)', marginTop: 4 }}>
            URL: /post/{slug || '...'}
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Descriere scurtă
          </label>
          <textarea className="admin-input" value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="O descriere scurtă pentru card și SEO..."
            rows={3} style={{ resize: 'vertical', minHeight: 80 }} />
        </div>

        {/* Video fields */}
        {type === 'video' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                YouTube URL
              </label>
              <input className="admin-input" value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ fontFamily: 'var(--mono)', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Durată
              </label>
              <input className="admin-input" value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="34:12"
                style={{ fontFamily: 'var(--mono)', fontSize: 13 }} />
            </div>
          </div>
        )}

        {/* Tags — multi select */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
            Tag-uri (click pentru a selecta/deselecta)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {allTags.map(tag => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.name)}
                  style={{
                    fontFamily: 'var(--mono)', fontSize: 11, padding: '5px 14px',
                    borderRadius: 16, cursor: 'pointer', transition: 'all 0.15s',
                    border: '1.5px solid',
                    ...(isSelected
                      ? { background: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }
                      : { background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }
                    ),
                  }}>
                  {isSelected ? '✓ ' : '#'}{tag.name}
                </button>
              );
            })}
          </div>

          {/* Add new tag inline */}
          <form onSubmit={handleAddNewTag} style={{ display: 'flex', gap: 8 }}>
            <input className="admin-input" value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              placeholder="Tag nou..."
              style={{ maxWidth: 200, fontSize: 12, padding: '8px 12px' }} />
            <button type="submit" className="admin-btn admin-btn-outline"
              style={{ padding: '8px 14px', fontSize: 10 }}>
              + Adaugă tag
            </button>
          </form>

          {selectedTags.length > 0 && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', marginTop: 8 }}>
              Selectate: {selectedTags.map(t => `#${t}`).join(', ')}
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Conținut (Markdown)
          </label>
          <textarea className="admin-textarea" value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Scrie conținutul aici... **bold**, *italic*, ## titluri, > citate" />
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-light)', marginTop: 4 }}>
            Suportă Markdown: **bold**, *italic*, ## heading, {'>'} citat, [link](url)
          </p>
        </div>

        {/* Draft toggle */}
        <div style={{ marginBottom: 32 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text-2)',
          }}>
            <input type="checkbox" checked={draft}
              onChange={e => setDraft(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
            Salvează ca draft
          </label>
        </div>

        {error && <p style={{ color: '#a03020', fontSize: 13, marginBottom: 16 }}>Eroare: {error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="admin-btn" disabled={saving}>
            {saving ? 'Se salvează...' : (isEdit ? 'Salvează' : 'Creează postarea')}
          </button>
          <Link href="/admin" className="admin-btn admin-btn-outline"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Anulează
          </Link>
        </div>
      </form>
    </div>
  );
}
