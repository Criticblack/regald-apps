-- =============================================
-- REGALD APPS — Schema Completă
-- Rulează totul dintr-o dată în Supabase > SQL Editor
-- =============================================

-- ==================
-- CATEGORII
-- ==================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cat_select" ON categories;
CREATE POLICY "cat_select" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "cat_admin" ON categories;
CREATE POLICY "cat_admin" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Blog', 'blog', 'Texte despre Android development, architecture, tools', 1),
  ('Streamuri', 'streamuri', 'Live coding sessions și înregistrări stream', 2)
ON CONFLICT (slug) DO NOTHING;

-- ==================
-- POSTS
-- ==================
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'video')),
  youtube_url TEXT,
  duration TEXT,
  tags TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  draft BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(draft, published_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "posts_public" ON posts;
CREATE POLICY "posts_public" ON posts FOR SELECT USING (draft = false);
DROP POLICY IF EXISTS "posts_auth_select" ON posts;
CREATE POLICY "posts_auth_select" ON posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "posts_auth_all" ON posts;
CREATE POLICY "posts_auth_all" ON posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================
-- TAGS
-- ==================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tags_select" ON tags;
CREATE POLICY "tags_select" ON tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "tags_admin" ON tags;
CREATE POLICY "tags_admin" ON tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO tags (name, slug) VALUES
  ('android', 'android'), ('kotlin', 'kotlin'), ('compose', 'compose'),
  ('architecture', 'architecture'), ('ml-kit', 'ml-kit'), ('api', 'api'),
  ('widgets', 'widgets'), ('mvvm', 'mvvm'), ('audio', 'audio'),
  ('clean-code', 'clean-code'), ('auth', 'auth')
ON CONFLICT (name) DO NOTHING;

-- ==================
-- PROFILES
-- ==================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create profile for existing admin
INSERT INTO profiles (id, display_name)
SELECT id, split_part(email, '@', 1) FROM auth.users WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT DO NOTHING;

-- ==================
-- COMMENTS
-- ==================
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at DESC);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_blocked = true));
DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete" ON comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ==================
-- RATINGS
-- ==================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_post ON ratings(post_id);
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ratings_select" ON ratings;
CREATE POLICY "ratings_select" ON ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "ratings_insert" ON ratings;
CREATE POLICY "ratings_insert" ON ratings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_blocked = true));
DROP POLICY IF EXISTS "ratings_update" ON ratings;
CREATE POLICY "ratings_update" ON ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ==================
-- ROADMAP
-- ==================
CREATE TABLE IF NOT EXISTS roadmap_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  privacy_policy TEXT,
  play_store_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roadmap_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES roadmap_topics(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE roadmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rt_select" ON roadmap_topics;
CREATE POLICY "rt_select" ON roadmap_topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "rt_admin" ON roadmap_topics;
CREATE POLICY "rt_admin" ON roadmap_topics FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ri_select" ON roadmap_items;
CREATE POLICY "ri_select" ON roadmap_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "ri_admin" ON roadmap_items;
CREATE POLICY "ri_admin" ON roadmap_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sample roadmap data
INSERT INTO roadmap_topics (title, description, sort_order) VALUES
  ('Fitness Tracker Pro', 'Full ML Kit pose detection app — squat & push-up counter', 1),
  ('Hear Voices', '3D spatial audio horror prank app', 2),
  ('Transport Widget', 'Real-time ticket widget system', 3),
  ('SpaceX Tracker', 'Real-time launch data app', 4)
ON CONFLICT DO NOTHING;

DO $$
DECLARE _t1 UUID; _t2 UUID; _t3 UUID; _t4 UUID;
BEGIN
  SELECT id INTO _t1 FROM roadmap_topics WHERE title = 'Fitness Tracker Pro' LIMIT 1;
  SELECT id INTO _t2 FROM roadmap_topics WHERE title = 'Hear Voices' LIMIT 1;
  SELECT id INTO _t3 FROM roadmap_topics WHERE title = 'Transport Widget' LIMIT 1;
  SELECT id INTO _t4 FROM roadmap_topics WHERE title = 'SpaceX Tracker' LIMIT 1;

  IF _t1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM roadmap_items WHERE topic_id = _t1) THEN
    INSERT INTO roadmap_items (topic_id, title, status, sort_order) VALUES
      (_t1, 'Squat detection cu ML Kit', 'done', 1),
      (_t1, 'Push-up counter', 'done', 2),
      (_t1, 'Rep tracking UI', 'done', 3),
      (_t1, 'Workout history & stats', 'in_progress', 4),
      (_t1, 'Export to Google Health', 'todo', 5);
  END IF;

  IF _t2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM roadmap_items WHERE topic_id = _t2) THEN
    INSERT INTO roadmap_items (topic_id, title, status, sort_order) VALUES
      (_t2, 'TTS engine integration', 'done', 1),
      (_t2, '3D spatial audio (OpenAL)', 'done', 2),
      (_t2, 'Challenge modes (Easy/Medium/Hard)', 'done', 3),
      (_t2, 'Leaderboard system', 'done', 4),
      (_t2, 'Play Store release', 'in_progress', 5);
  END IF;

  IF _t3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM roadmap_items WHERE topic_id = _t3) THEN
    INSERT INTO roadmap_items (topic_id, title, status, sort_order) VALUES
      (_t3, 'Widget layout & design', 'done', 1),
      (_t3, 'API auth integration', 'done', 2),
      (_t3, 'Live ticket state sync', 'done', 3),
      (_t3, 'Background refresh service', 'in_progress', 4),
      (_t3, 'Multi-language support', 'todo', 5);
  END IF;

  IF _t4 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM roadmap_items WHERE topic_id = _t4) THEN
    INSERT INTO roadmap_items (topic_id, title, status, sort_order) VALUES
      (_t4, 'SpaceX API integration', 'done', 1),
      (_t4, 'Launch timeline UI', 'done', 2),
      (_t4, 'Push notifications', 'done', 3);
  END IF;
END $$;

-- ==================
-- SAMPLE POSTS
-- ==================
INSERT INTO posts (title, slug, description, content, type, youtube_url, duration, tags, category_id, draft, published_at) VALUES
(
  'Building a Fitness Tracker with ML Kit',
  'fitness-tracker-ml-kit',
  'Live coding session — pose detection in Kotlin, counting reps with computer vision.',
  E'## Stream Recap\n\nAzi am construit un **squat counter** folosind ML Kit Pose Detection.\n\n### Ce am acoperit:\n\n- Setup ML Kit în proiect Android\n- Detectarea punctelor cheie ale corpului\n- Logica de numărare a repetărilor\n- UI cu Jetpack Compose\n\n> Cel mai greu a fost edge-case-ul când camera pierde tracking-ul mid-rep.\n\n### Cod cheie\n\n```kotlin\nfun isSquatDown(pose: Pose): Boolean {\n    val hip = pose.getPoseLandmark(PoseLandmark.LEFT_HIP)\n    val knee = pose.getPoseLandmark(PoseLandmark.LEFT_KNEE)\n    return hip != null && knee != null && hip.position.y > knee.position.y * 0.85\n}\n```\n\nUrmătorul stream: push-up counter!',
  'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '1:24:30',
  ARRAY['android', 'ml-kit', 'kotlin'],
  (SELECT id FROM categories WHERE slug = 'streamuri'),
  false, now() - interval '2 days'
),
(
  'Jetpack Compose: Widget State Management',
  'compose-widget-state',
  'Cum am rezolvat sincronizarea stării între widget și app-ul principal.',
  E'## Problema\n\nWidget-urile Android sunt **notorious** pentru state management. Glance (noul framework de la Google) ajută, dar are limitări.\n\n### Soluția mea\n\nAm folosit un pattern cu:\n1. `WorkManager` pentru refresh periodic\n2. `DataStore` ca single source of truth\n3. `BroadcastReceiver` pentru update-uri instant\n\n```kotlin\nclass TicketWidgetReceiver : GlanceAppWidgetReceiver() {\n    override val glanceAppWidget = TicketWidget()\n    \n    override fun onReceive(context: Context, intent: Intent) {\n        super.onReceive(context, intent)\n        if (intent.action == ACTION_REFRESH) {\n            TicketWidget().update(context)\n        }\n    }\n}\n```\n\n### Lecții învățate\n\n- **Nu** stoca state în widget direct\n- Folosește `updateAll()` nu `update()` cu ID specific\n- `WorkManager` cu `ExistingPeriodicWorkPolicy.KEEP`\n\nWidget-ul acum se refreshuiește corect în 95% din cazuri. Restul de 5%? Android being Android.',
  'text', NULL, NULL,
  ARRAY['compose', 'widgets', 'architecture'],
  (SELECT id FROM categories WHERE slug = 'blog'),
  false, now() - interval '7 days'
),
(
  'MVVM is Not Enough',
  'mvvm-not-enough',
  'De ce clean architecture contează mai mult decât crezi când app-ul crește.',
  E'## Hot Take\n\nToți predau MVVM ca soluția universală. Dar când app-ul tău are 50+ ecrane, MVVM singur devine **haos**.\n\n### Ce lipsește\n\n- **Use Cases** — logica de business nu aparține ViewModel-ului\n- **Repository Pattern** — abstracție peste data sources\n- **Dependency Injection** — Hilt sau Koin, alege unul\n\n### Structura mea\n\n```\ndata/\n  ├── remote/     (API)\n  ├── local/      (Room DB)\n  └── repository/ (combină ambele)\ndomain/\n  ├── model/      (entity-uri pure)\n  └── usecase/    (logică de business)\npresentation/\n  ├── viewmodel/\n  └── ui/         (Compose screens)\n```\n\n> **Regulă de aur**: dacă ViewModel-ul tău are mai mult de 200 linii, ceva e greșit.\n\nNu e rocket science. E doar disciplină.',
  'text', NULL, NULL,
  ARRAY['architecture', 'mvvm', 'clean-code'],
  (SELECT id FROM categories WHERE slug = 'blog'),
  false, now() - interval '20 days'
)
ON CONFLICT (slug) DO NOTHING;

-- ==================
-- IMPORTANT: Setează-te ca admin!
-- ==================
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'emailul-tau@gmail.com');
