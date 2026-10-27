-- =================================================================
-- SKEMA ULASAN & RATING BINTANG KURSUS PIJAR AKSARA
-- Jalankan skrip ini di SQL Editor Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/mtkcqsxoiqkwotwkesqz/sql/new
-- =================================================================

CREATE TABLE IF NOT EXISTS public.ulasan_kursus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.kursus(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'Peserta Terverifikasi',
  user_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  komentar TEXT NOT NULL,
  is_verified_student BOOLEAN NOT NULL DEFAULT true,
  kursus_judul TEXT,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pencarian cepat
CREATE INDEX IF NOT EXISTS idx_ulasan_course_id ON public.ulasan_kursus(course_id);

-- Row Level Security (RLS)
ALTER TABLE public.ulasan_kursus ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Semua orang bisa membaca ulasan kursus"
    ON public.ulasan_kursus FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Pengguna terautentikasi bisa menambah ulasan"
    ON public.ulasan_kursus FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
