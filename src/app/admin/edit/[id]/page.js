'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import PostEditor from '@/components/PostEditor';

export default function EditPostPage() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) { router.push('/admin'); return; }
      setPost(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text-muted)',
      }}>
        Se încarcă...
      </div>
    );
  }

  return <PostEditor initialData={post} />;
}
