-- ═══════════════════════════════════════════════════════════════════════════
-- TimeKids — Supabase Database Schema + Row Level Security
-- Run this in your Supabase SQL editor (Project → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data (plan, display name, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  VARCHAR,
  email         VARCHAR,
  plan          VARCHAR NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  avatar_url    TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. AUDIO CONTENT TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audio_content (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR NOT NULL,
  type         VARCHAR NOT NULL CHECK (type IN ('lullaby', 'story')),
  category     VARCHAR NOT NULL,
  audio_url    TEXT NOT NULL,
  description  TEXT,
  duration     INTEGER,           -- duration in seconds
  is_youtube   BOOLEAN DEFAULT FALSE,
  uploaded_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_audio_content_title ON public.audio_content USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_audio_content_type ON public.audio_content(type);
CREATE INDEX IF NOT EXISTS idx_audio_content_category ON public.audio_content(category);
CREATE INDEX IF NOT EXISTS idx_audio_content_uploaded_by ON public.audio_content(uploaded_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FAVORITES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_id   UUID NOT NULL REFERENCES public.audio_content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, audio_id)  -- prevent duplicates
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites      ENABLE ROW LEVEL SECURITY;

-- ── profiles policies ───────────────────────────────────────────────────────
CREATE POLICY "profiles: users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── audio_content policies ──────────────────────────────────────────────────
-- Anyone can read all audio (public library)
CREATE POLICY "audio_content: public read"
  ON public.audio_content FOR SELECT
  USING (true);

-- Auth users can insert their own content
CREATE POLICY "audio_content: auth users can insert"
  ON public.audio_content FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by OR uploaded_by IS NULL);

-- Users can only update/delete their own uploads
CREATE POLICY "audio_content: users can update own"
  ON public.audio_content FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "audio_content: users can delete own"
  ON public.audio_content FOR DELETE
  USING (auth.uid() = uploaded_by);

-- ── favorites policies ──────────────────────────────────────────────────────
CREATE POLICY "favorites: users can manage own"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. STORAGE BUCKET
-- Run separately in Supabase Storage settings, or via this SQL:
-- ─────────────────────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true)
-- ON CONFLICT DO NOTHING;
--
-- CREATE POLICY "audio-files: public read"
--   ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');
--
-- CREATE POLICY "audio-files: auth upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "audio-files: users delete own"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED DATA — sample tracks (YouTube-based, free to use)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.audio_content (title, type, category, audio_url, description, is_youtube) VALUES
  ('Brahms Lullaby',         'lullaby', 'Classical',  'https://www.youtube.com/embed/YcFGdB9BLYA', 'The classic Brahms lullaby — perfect for sleep.', TRUE),
  ('Twinkle Twinkle',        'lullaby', 'Children',   'https://www.youtube.com/embed/yCjJyiqpAuU', 'Gentle piano rendition of Twinkle Twinkle.', TRUE),
  ('Ocean Waves & Piano',    'lullaby', 'Nature',     'https://www.youtube.com/embed/1ZYbU82GVz4', 'Soothing ocean waves with soft piano.', TRUE),
  ('Moonlight Sonata',       'lullaby', 'Classical',  'https://www.youtube.com/embed/4Tr0otuiQuU', 'Beethoven''s gentle moonlight sonata.', TRUE),
  ('Rain on Leaves',         'lullaby', 'Nature',     'https://www.youtube.com/embed/mPZkdNFkNps', 'Calming rain sounds on forest leaves.', TRUE),
  ('Soft Piano Meditation',  'lullaby', 'Piano',      'https://www.youtube.com/embed/lFcSrYw2lGQ', 'Peaceful piano music for deep relaxation.', TRUE),
  ('The Velveteen Rabbit',   'story',   'Classic',    'https://www.youtube.com/embed/7TcPvGKSqeE', 'The beloved story of a toy rabbit.', TRUE),
  ('Goodnight Moon',         'story',   'Children',   'https://www.youtube.com/embed/cT4BEdpS3FE', 'A calming bedtime story classic.', TRUE),
  ('The Snowy Day',          'story',   'Winter',     'https://www.youtube.com/embed/4Gsg4sIRlBY', 'A magical winter day adventure.', TRUE),
  ('Where the Wild Things Are', 'story','Adventure',  'https://www.youtube.com/embed/pBmVwvGIr8A', 'Maurice Sendak''s classic tale.', TRUE)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. HELPER FUNCTION — count user audio by type (used by plan limit checks)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.count_user_audio(p_user_id UUID, p_type VARCHAR)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.audio_content
  WHERE uploaded_by = p_user_id AND type = p_type;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. PLAYLISTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        VARCHAR NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  audio_id    UUID NOT NULL REFERENCES public.audio_content(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, audio_id)
);

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON public.playlist_items(playlist_id);

ALTER TABLE public.playlists       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists: users manage own"
  ON public.playlists FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "playlist_items: users manage via playlist"
  ON public.playlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. LISTEN HISTORY (optional — tracks continue-listening server-side)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listen_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_id    UUID NOT NULL REFERENCES public.audio_content(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,   -- seconds
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, audio_id)
);

ALTER TABLE public.listen_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listen_history: users manage own"
  ON public.listen_history FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
