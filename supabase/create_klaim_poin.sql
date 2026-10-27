-- =================================================================
-- SKEMA KLAIM KURSUS GRATIS VIA POIN REWARD (GAMIFIKASI)
-- Jalankan skrip ini di SQL Editor Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/mtkcqsxoiqkwotwkesqz/sql/new
-- =================================================================

CREATE TABLE IF NOT EXISTS public.klaim_kursus_poin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pengguna_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pengguna_nama TEXT NOT NULL,
  pengguna_email TEXT NOT NULL,
  kursus_id UUID REFERENCES public.kursus(id) ON DELETE CASCADE,
  kursus_judul TEXT NOT NULL,
  kursus_slug TEXT NOT NULL,
  poin_digunakan INT NOT NULL DEFAULT 1500,
  status TEXT NOT NULL DEFAULT 'menunggu_review' CHECK (status IN ('menunggu_review', 'disetujui', 'ditolak')),
  catatan_peserta TEXT,
  catatan_admin TEXT,
  direview_oleh TEXT,
  direview_pada TIMESTAMPTZ,
  total_sertifikat_peserta INT DEFAULT 0,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pencarian cepat
CREATE INDEX IF NOT EXISTS idx_klaim_pengguna ON public.klaim_kursus_poin(pengguna_id);
CREATE INDEX IF NOT EXISTS idx_klaim_status ON public.klaim_kursus_poin(status);

-- Row Level Security (RLS)
ALTER TABLE public.klaim_kursus_poin ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Semua orang terautentikasi bisa membaca klaim poin"
    ON public.klaim_kursus_poin FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Pengguna terautentikasi bisa mengajukan klaim poin"
    ON public.klaim_kursus_poin FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admin bisa mengupdate status klaim poin"
    ON public.klaim_kursus_poin FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
