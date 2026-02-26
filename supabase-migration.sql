-- ============================================================
-- Multi-language Migration: TEXT columns → JSONB
-- Run this in Supabase SQL Editor
-- Existing data is preserved as Romanian ('ro')
-- ============================================================

-- ─── POSTS: title ───
ALTER TABLE posts ADD COLUMN title_i18n JSONB;
UPDATE posts SET title_i18n = jsonb_build_object('ro', COALESCE(title, ''), 'en', '', 'ru', '');
ALTER TABLE posts DROP COLUMN title;
ALTER TABLE posts RENAME COLUMN title_i18n TO title;

-- ─── POSTS: description ───
ALTER TABLE posts ADD COLUMN description_i18n JSONB;
UPDATE posts SET description_i18n = jsonb_build_object('ro', COALESCE(description, ''), 'en', '', 'ru', '');
ALTER TABLE posts DROP COLUMN description;
ALTER TABLE posts RENAME COLUMN description_i18n TO description;

-- ─── POSTS: content ───
ALTER TABLE posts ADD COLUMN content_i18n JSONB;
UPDATE posts SET content_i18n = jsonb_build_object('ro', COALESCE(content, ''), 'en', '', 'ru', '');
ALTER TABLE posts DROP COLUMN content;
ALTER TABLE posts RENAME COLUMN content_i18n TO content;

-- ─── CATEGORIES: name ───
ALTER TABLE categories ADD COLUMN name_i18n JSONB;
UPDATE categories SET name_i18n = jsonb_build_object('ro', COALESCE(name, ''), 'en', '', 'ru', '');
ALTER TABLE categories DROP COLUMN name;
ALTER TABLE categories RENAME COLUMN name_i18n TO name;

-- ─── CATEGORIES: description ───
ALTER TABLE categories ADD COLUMN description_i18n JSONB;
UPDATE categories SET description_i18n = CASE
  WHEN description IS NOT NULL THEN jsonb_build_object('ro', description, 'en', '', 'ru', '')
  ELSE NULL
END;
ALTER TABLE categories DROP COLUMN description;
ALTER TABLE categories RENAME COLUMN description_i18n TO description;

-- ─── ROADMAP_TOPICS: title ───
ALTER TABLE roadmap_topics ADD COLUMN title_i18n JSONB;
UPDATE roadmap_topics SET title_i18n = jsonb_build_object('ro', COALESCE(title, ''), 'en', '', 'ru', '');
ALTER TABLE roadmap_topics DROP COLUMN title;
ALTER TABLE roadmap_topics RENAME COLUMN title_i18n TO title;

-- ─── ROADMAP_TOPICS: description ───
ALTER TABLE roadmap_topics ADD COLUMN description_i18n JSONB;
UPDATE roadmap_topics SET description_i18n = CASE
  WHEN description IS NOT NULL THEN jsonb_build_object('ro', description, 'en', '', 'ru', '')
  ELSE NULL
END;
ALTER TABLE roadmap_topics DROP COLUMN description;
ALTER TABLE roadmap_topics RENAME COLUMN description_i18n TO description;

-- ─── ROADMAP_ITEMS: title ───
ALTER TABLE roadmap_items ADD COLUMN title_i18n JSONB;
UPDATE roadmap_items SET title_i18n = jsonb_build_object('ro', COALESCE(title, ''), 'en', '', 'ru', '');
ALTER TABLE roadmap_items DROP COLUMN title;
ALTER TABLE roadmap_items RENAME COLUMN title_i18n TO title;

-- ============================================================
-- Migration complete!
-- Supabase returns JSONB as JS objects automatically,
-- so components can access: post.title.ro, post.title.en, etc.
-- ============================================================
