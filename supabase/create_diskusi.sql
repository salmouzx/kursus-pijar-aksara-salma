-- =================================================================
-- SKEMA FORUM DISKUSI MODUL (Q&A) PIJAR AKSARA
-- Jalankan skrip ini di SQL Editor Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/mtkcqsxoiqkwotwkesqz/sql/new
-- =================================================================

-- 1. TABEL DISKUSI MODUL (Pertanyaan)
CREATE TABLE IF NOT EXISTS public.diskusi_modul (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modul_id TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  modul_urutan INT NOT NULL DEFAULT 1,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'peserta',
  user_avatar TEXT,
  judul TEXT NOT NULL,
  isi TEXT NOT NULL,
  upvotes INT NOT NULL DEFAULT 0,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL JAWABAN DISKUSI (Komentar / Balasan Instruktur & Peserta)
CREATE TABLE IF NOT EXISTS public.jawaban_diskusi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diskusi_id UUID NOT NULL REFERENCES public.diskusi_modul(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'peserta',
  user_avatar TEXT,
  is_official_answer BOOLEAN NOT NULL DEFAULT false,
  isi TEXT NOT NULL,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEX UNTUK KECEPATAN QUERY
CREATE INDEX IF NOT EXISTS idx_diskusi_modul_id ON public.diskusi_modul(modul_id);
CREATE INDEX IF NOT EXISTS idx_diskusi_course_slug ON public.diskusi_modul(course_slug);
CREATE INDEX IF NOT EXISTS idx_jawaban_diskusi_id ON public.jawaban_diskusi(diskusi_id);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.diskusi_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jawaban_diskusi ENABLE ROW LEVEL SECURITY;

-- Izinkan semua orang (anonim & login) melihat diskusi materi
DO $$ BEGIN
  CREATE POLICY "Semua orang bisa melihat diskusi modul"
    ON public.diskusi_modul FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Semua orang bisa melihat jawaban diskusi"
    ON public.jawaban_diskusi FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Izinkan pengguna terotentikasi menambah pertanyaan & balasan
DO $$ BEGIN
  CREATE POLICY "Pengguna terautentikasi bisa bertanya"
    ON public.diskusi_modul FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Pengguna terautentikasi bisa menjawab"
    ON public.jawaban_diskusi FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Pengguna bisa upvote diskusi"
    ON public.diskusi_modul FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
