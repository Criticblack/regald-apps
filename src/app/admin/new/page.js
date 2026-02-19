'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import PostEditor from '@/components/PostEditor';

export default function NewPostPage() {
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/admin/login');
      else setAuthed(true);
    });
  }, []);

  if (!authed) return null;
  return <PostEditor />;
}
