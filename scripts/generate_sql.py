import zipfile
import xml.etree.ElementTree as ET
import os
import json

def parse_sheet(z, sheet_target):
    ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    s_root = ET.fromstring(z.read(sheet_target))
    rows_data = []
    for r in s_root.findall('.//s:row', ns):
        vals = []
        for c in r.findall('s:c', ns):
            ist = c.find('.//s:t', ns)
            v = c.find('s:v', ns)
            f = c.find('s:f', ns)
            if ist is not None and ist.text:
                vals.append(ist.text)
            elif v is not None and v.text:
                vals.append(v.text)
            elif f is not None and f.text:
                vals.append('=' + f.text)
            else:
                vals.append('')
        if any(vals):
            rows_data.append(vals)
    return rows_data

def sql_str(val):
    if val is None or val == '':
        return 'NULL'
    escaped = val.replace("'", "''")
    return f"'{escaped}'"

def sql_bool(val):
    if val in ['1', 1, 'true', 'TRUE', True]:
        return 'true'
    return 'false'

def sql_int(val):
    if val is None or val == '':
        return 'NULL'
    return str(int(float(val)))

def sql_json(val):
    if val is None or val == '':
        return 'NULL'
    escaped = val.replace("'", "''")
    return f"'{escaped}'::jsonb"

def sql_tz(val):
    if val is None or val == '':
        return 'NULL'
    return f"'{val}'::timestamptz"

def main():
    os.makedirs('supabase', exist_ok=True)
    with zipfile.ZipFile('Data_Contoh_LMS.xlsx') as z:
        wb_root = ET.fromstring(z.read('xl/workbook.xml'))
        ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        sheets = {e.attrib['name']: e.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'] for e in wb_root.findall('.//s:sheet', ns)}
        rels_root = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        r_ns = {'pr': 'http://schemas.openxmlformats.org/package/2006/relationships'}
        rel_map = {e.attrib['Id']: e.attrib['Target'] for e in rels_root.findall('.//pr:Relationship', r_ns)}
        
        data_tables = {}
        for name in ['Akun Uji', 'profiles', 'kursus', 'modul', 'soal', 'pendaftaran', 'progres_modul', 'percobaan_kuis', 'sertifikat', 'audit_log']:
            target = rel_map[sheets[name]].lstrip('/')
            rows = parse_sheet(z, target)
            data_tables[name] = rows

    out = []
    out.append("-- =================================================================")
    out.append("-- LMS LEMBAGA KURSUS PIJAR AKSARA - SETUP SCHEMA & SEED DATA")
    out.append("-- Sesuai ERD_LMS.pdf, ERD_LMS.png, & PRD_LMS.docx.md")
    out.append("-- =================================================================\n")
    
    out.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    out.append("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";\n")

    # ENUMS
    out.append("-- 1. ENUM TYPES")
    out.append("DO $$ BEGIN")
    out.append("  CREATE TYPE peran_pengguna AS ENUM ('peserta', 'instruktur', 'admin');")
    out.append("EXCEPTION WHEN duplicate_object THEN NULL; END $$;")
    out.append("DO $$ BEGIN")
    out.append("  CREATE TYPE status_kursus AS ENUM ('draf', 'ditinjau', 'terbit', 'ditutup');")
    out.append("EXCEPTION WHEN duplicate_object THEN NULL; END $$;")
    out.append("DO $$ BEGIN")
    out.append("  CREATE TYPE status_pendaftaran AS ENUM ('menunggu_bayar', 'aktif', 'selesai', 'kedaluwarsa', 'dibatalkan');")
    out.append("EXCEPTION WHEN duplicate_object THEN NULL; END $$;")
    out.append("DO $$ BEGIN")
    out.append("  CREATE TYPE metode_bayar AS ENUM ('gratis', 'transfer_manual', 'mayar');")
    out.append("EXCEPTION WHEN duplicate_object THEN NULL; END $$;\n")

    # DDL TABLES
    out.append("-- 2. TABLES DEFINITION")
    out.append("""
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  no_hp TEXT,
  peran peran_pengguna NOT NULL DEFAULT 'peserta',
  aktif BOOLEAN NOT NULL DEFAULT true,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kursus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instruktur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  judul TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  kategori TEXT NOT NULL,
  ringkasan TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  harga INTEGER NOT NULL DEFAULT 0,
  kuota INTEGER NOT NULL DEFAULT 20,
  nilai_lulus SMALLINT NOT NULL DEFAULT 70,
  status status_kursus NOT NULL DEFAULT 'draf',
  catatan_tinjauan TEXT,
  diajukan_pada TIMESTAMPTZ,
  diterbitkan_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diubah_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modul (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kursus_id UUID NOT NULL REFERENCES public.kursus(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  judul TEXT NOT NULL,
  isi_materi TEXT NOT NULL,
  video_url TEXT,
  lampiran_path TEXT,
  durasi_menit SMALLINT NOT NULL DEFAULT 15,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(kursus_id, urutan)
);

CREATE TABLE IF NOT EXISTS public.soal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modul_id UUID NOT NULL REFERENCES public.modul(id) ON DELETE CASCADE,
  urutan SMALLINT NOT NULL,
  pertanyaan TEXT NOT NULL,
  pilihan_a TEXT NOT NULL,
  pilihan_b TEXT NOT NULL,
  pilihan_c TEXT NOT NULL,
  pilihan_d TEXT NOT NULL,
  kunci_jawaban CHAR(1) NOT NULL CHECK (kunci_jawaban IN ('A', 'B', 'C', 'D')),
  UNIQUE(modul_id, urutan)
);

CREATE TABLE IF NOT EXISTS public.pendaftaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kursus_id UUID NOT NULL REFERENCES public.kursus(id) ON DELETE RESTRICT,
  peserta_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status status_pendaftaran NOT NULL,
  nominal INTEGER NOT NULL DEFAULT 0,
  metode_bayar metode_bayar NOT NULL,
  batas_bayar TIMESTAMPTZ,
  mayar_invoice_id TEXT UNIQUE,
  dibayar_pada TIMESTAMPTZ,
  dikonfirmasi_oleh UUID REFERENCES public.profiles(id),
  alasan_batal TEXT,
  didaftarkan_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  selesai_pada TIMESTAMPTZ,
  dibatalkan_pada TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pendaftaran_aktif_unik 
ON public.pendaftaran (kursus_id, peserta_id) 
WHERE status IN ('menunggu_bayar', 'aktif', 'selesai');

CREATE TABLE IF NOT EXISTS public.progres_modul (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pendaftaran_id UUID NOT NULL REFERENCES public.pendaftaran(id) ON DELETE CASCADE,
  modul_id UUID NOT NULL REFERENCES public.modul(id) ON DELETE CASCADE,
  materi_dibaca_pada TIMESTAMPTZ,
  lulus_pada TIMESTAMPTZ,
  UNIQUE(pendaftaran_id, modul_id)
);

CREATE TABLE IF NOT EXISTS public.percobaan_kuis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pendaftaran_id UUID NOT NULL REFERENCES public.pendaftaran(id) ON DELETE CASCADE,
  modul_id UUID NOT NULL REFERENCES public.modul(id) ON DELETE CASCADE,
  nomor_percobaan SMALLINT NOT NULL CHECK (nomor_percobaan BETWEEN 1 AND 3),
  jawaban JSONB NOT NULL,
  jumlah_soal SMALLINT NOT NULL,
  jumlah_benar SMALLINT NOT NULL,
  nilai SMALLINT NOT NULL,
  lulus BOOLEAN NOT NULL DEFAULT false,
  dikerjakan_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pendaftaran_id, modul_id, nomor_percobaan)
);

CREATE TABLE IF NOT EXISTS public.sertifikat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pendaftaran_id UUID NOT NULL UNIQUE REFERENCES public.pendaftaran(id) ON DELETE CASCADE,
  tahun SMALLINT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  nomor_urut INTEGER NOT NULL,
  nomor_sertifikat TEXT NOT NULL UNIQUE,
  nama_peserta TEXT NOT NULL,
  judul_kursus TEXT NOT NULL,
  diterbitkan_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  pelaku_id UUID REFERENCES public.profiles(id),
  aksi TEXT NOT NULL,
  nama_tabel TEXT NOT NULL,
  id_data UUID,
  data_sebelum JSONB,
  data_sesudah JSONB,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);
""")

    out.append("-- 3. VIEWS & RPC FUNCTIONS")
    out.append("""
-- View Soal tanpa kunci jawaban untuk peserta (BR-09 & TC-18)
CREATE OR REPLACE VIEW public.view_soal_peserta AS
SELECT id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d
FROM public.soal;

-- Fungsi hitung sisa kursi (BR-06)
CREATE OR REPLACE FUNCTION public.hitung_sisa_kursi(p_kursus_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_kuota INTEGER;
  v_terpakai INTEGER;
BEGIN
  SELECT kuota INTO v_kuota FROM public.kursus WHERE id = p_kursus_id;
  IF v_kuota IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*) INTO v_terpakai 
  FROM public.pendaftaran 
  WHERE kursus_id = p_kursus_id 
    AND (status IN ('aktif', 'selesai') OR (status = 'menunggu_bayar' AND (batas_bayar IS NULL OR batas_bayar > now())));
    
  RETURN GREATEST(0, v_kuota - v_terpakai);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Trigger untuk sync auth.users ke public.profiles saat register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'no_hp',
    COALESCE((NEW.raw_user_meta_data->>'peran')::peran_pengguna, 'peserta'::peran_pengguna),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    nama_lengkap = EXCLUDED.nama_lengkap,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
""")

    out.append("\n-- 4. INSERT TEST USERS KE auth.users & profiles")
    out.append("-- Menggunakan password default: Latihan#2026")
    
    # Map profiles
    prof_headers = data_tables['profiles'][0]
    prof_rows = data_tables['profiles'][1:]
    
    for r in prof_rows:
        pid, nama, email, no_hp, peran, aktif, dibuat = r
        meta_json = json.dumps({"nama_lengkap": nama, "no_hp": no_hp, "peran": peran}).replace("'", "''")
        identity_data = json.dumps({"sub": pid, "email": email}).replace("'", "''")
        out.append(f"""
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-4000-a000-000000000000',
  '{pid}',
  'authenticated',
  'authenticated',
  '{email}',
  crypt('Latihan#2026', gen_salt('bf')),
  now(),
  '{{"provider":"email","providers":["email"]}}'::jsonb,
  '{meta_json}'::jsonb,
  {sql_tz(dibuat)},
  {sql_tz(dibuat)},
  '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
  encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
  raw_user_meta_data = '{meta_json}'::jsonb;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '{pid}',
  '{pid}',
  '{identity_data}'::jsonb,
  'email',
  '{email}',
  now(),
  {sql_tz(dibuat)},
  {sql_tz(dibuat)}
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('{pid}', {sql_str(nama)}, '{email}', {sql_str(no_hp)}, '{peran}', {sql_bool(aktif)}, {sql_tz(dibuat)})
ON CONFLICT (id) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  no_hp = EXCLUDED.no_hp,
  peran = EXCLUDED.peran;
""")

    out.append("\n-- 5. INSERT SEED DATA KURSUS")
    for r in data_tables['kursus'][1:]:
        kid, iid, judul, slug, kat, ringkasan, deskripsi, harga, kuota, lulus, status, catatan, diajukan, diterbitkan, dibuat, diubah = r
        out.append(f"""
INSERT INTO public.kursus (id, instruktur_id, judul, slug, kategori, ringkasan, deskripsi, harga, kuota, nilai_lulus, status, catatan_tinjauan, diajukan_pada, diterbitkan_pada, dibuat_pada, diubah_pada)
VALUES ('{kid}', '{iid}', {sql_str(judul)}, {sql_str(slug)}, {sql_str(kat)}, {sql_str(ringkasan)}, {sql_str(deskripsi)}, {sql_int(harga)}, {sql_int(kuota)}, {sql_int(lulus)}, '{status}', {sql_str(catatan)}, {sql_tz(diajukan)}, {sql_tz(diterbitkan)}, {sql_tz(dibuat)}, {sql_tz(diubah)})
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 6. INSERT SEED DATA MODUL")
    for r in data_tables['modul'][1:]:
        mid, kid, urutan, judul, isi, video, lampiran, durasi, dibuat = r
        out.append(f"""
INSERT INTO public.modul (id, kursus_id, urutan, judul, isi_materi, video_url, lampiran_path, durasi_menit, dibuat_pada)
VALUES ('{mid}', '{kid}', {sql_int(urutan)}, {sql_str(judul)}, {sql_str(isi)}, {sql_str(video)}, {sql_str(lampiran)}, {sql_int(durasi)}, {sql_tz(dibuat)})
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 7. INSERT SEED DATA SOAL")
    for r in data_tables['soal'][1:]:
        sid, mid, urutan, tanya, pa, pb, pc, pd, kunci = r
        out.append(f"""
INSERT INTO public.soal (id, modul_id, urutan, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban)
VALUES ('{sid}', '{mid}', {sql_int(urutan)}, {sql_str(tanya)}, {sql_str(pa)}, {sql_str(pb)}, {sql_str(pc)}, {sql_str(pd)}, '{kunci}')
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 8. INSERT SEED DATA PENDAFTARAN")
    for r in data_tables['pendaftaran'][1:]:
        pid, kid, peserta_id, status, nominal, metode, batas, invoice, dibayar, konfirm_oleh, alasan, didaftarkan, selesai, dibatalkan = r
        out.append(f"""
INSERT INTO public.pendaftaran (id, kursus_id, peserta_id, status, nominal, metode_bayar, batas_bayar, mayar_invoice_id, dibayar_pada, dikonfirmasi_oleh, alasan_batal, didaftarkan_pada, selesai_pada, dibatalkan_pada)
VALUES ('{pid}', '{kid}', '{peserta_id}', '{status}', {sql_int(nominal)}, '{metode}', {sql_tz(batas)}, {sql_str(invoice)}, {sql_tz(dibayar)}, {sql_str(konfirm_oleh)}, {sql_str(alasan)}, {sql_tz(didaftarkan)}, {sql_tz(selesai)}, {sql_tz(dibatalkan)})
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 9. INSERT SEED DATA PROGRES MODUL")
    for r in data_tables['progres_modul'][1:]:
        pmid, pid, mid, baca, lulus = r
        out.append(f"""
INSERT INTO public.progres_modul (id, pendaftaran_id, modul_id, materi_dibaca_pada, lulus_pada)
VALUES ('{pmid}', '{pid}', '{mid}', {sql_tz(baca)}, {sql_tz(lulus)})
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 10. INSERT SEED DATA PERCOBAAN KUIS")
    for r in data_tables['percobaan_kuis'][1:]:
        pkid, pid, mid, nomor, jawaban, total, benar, nilai, lulus, waktu = r
        out.append(f"""
INSERT INTO public.percobaan_kuis (id, pendaftaran_id, modul_id, nomor_percobaan, jawaban, jumlah_soal, jumlah_benar, nilai, lulus, dikerjakan_pada)
VALUES ('{pkid}', '{pid}', '{mid}', {sql_int(nomor)}, {sql_json(jawaban)}, {sql_int(total)}, {sql_int(benar)}, {sql_int(nilai)}, {sql_bool(lulus)}, {sql_tz(waktu)})
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 11. INSERT SEED DATA SERTIFIKAT")
    for r in data_tables['sertifikat'][1:]:
        sid, pid, tahun, nomor_urut, nomor_sertifikat, nama, judul, terbit = r
        out.append(f"""
INSERT INTO public.sertifikat (id, pendaftaran_id, tahun, nomor_urut, nomor_sertifikat, nama_peserta, judul_kursus, diterbitkan_pada)
VALUES ('{sid}', '{pid}', {sql_int(tahun)}, {sql_int(nomor_urut)}, '{nomor_sertifikat}', {sql_str(nama)}, {sql_str(judul)}, {sql_tz(terbit)})
ON CONFLICT (id) DO NOTHING;
""")

    out.append("\n-- 12. INSERT SEED DATA AUDIT LOG")
    for r in data_tables['audit_log'][1:]:
        aid, pelaku, aksi, tabel, id_data, sblm, ssdh, dibuat = r
        out.append(f"""
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, id_data, data_sebelum, data_sesudah, dibuat_pada)
VALUES ({sql_int(aid)}, '{pelaku}', '{aksi}', '{tabel}', {sql_str(id_data)}, {sql_json(sblm)}, {sql_json(ssdh)}, {sql_tz(dibuat)})
ON CONFLICT (id) DO NOTHING;
""")

    # RLS Policies
    out.append("\n-- 13. ROW LEVEL SECURITY (RLS) POLICIES")
    out.append("""
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kursus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pendaftaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progres_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.percobaan_kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sertifikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function cek peran admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND peran = 'admin' AND aktif = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function cek peran instruktur
CREATE OR REPLACE FUNCTION public.is_instruktur()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND peran = 'instruktur' AND aktif = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: publik baca, user update profil sendiri, admin kelola semua
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
CREATE POLICY "Admin manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Kursus: publik hanya bisa lihat kursus terbit, instruktur lihat milik sendiri, admin lihat semua
DROP POLICY IF EXISTS "Public read terbit kursus" ON public.kursus;
CREATE POLICY "Public read terbit kursus" ON public.kursus FOR SELECT 
USING (status = 'terbit' OR instruktur_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Instruktur create kursus" ON public.kursus;
CREATE POLICY "Instruktur create kursus" ON public.kursus FOR INSERT 
WITH CHECK (instruktur_id = auth.uid() AND public.is_instruktur());

DROP POLICY IF EXISTS "Instruktur update draf kursus" ON public.kursus;
CREATE POLICY "Instruktur update draf kursus" ON public.kursus FOR UPDATE 
USING (instruktur_id = auth.uid() AND status = 'draf')
WITH CHECK (instruktur_id = auth.uid());

DROP POLICY IF EXISTS "Admin manage kursus" ON public.kursus;
CREATE POLICY "Admin manage kursus" ON public.kursus FOR ALL USING (public.is_admin());

-- Modul: publik bisa lihat ringkasan modul kursus terbit, instruktur pemilik, atau admin
DROP POLICY IF EXISTS "Read modul" ON public.modul;
CREATE POLICY "Read modul" ON public.modul FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.kursus k WHERE k.id = kursus_id AND (k.status = 'terbit' OR k.instruktur_id = auth.uid() OR public.is_admin()))
);

DROP POLICY IF EXISTS "Instruktur manage draf modul" ON public.modul;
CREATE POLICY "Instruktur manage draf modul" ON public.modul FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.kursus k WHERE k.id = kursus_id AND k.instruktur_id = auth.uid() AND k.status = 'draf')
);

DROP POLICY IF EXISTS "Admin manage modul" ON public.modul;
CREATE POLICY "Admin manage modul" ON public.modul FOR ALL USING (public.is_admin());

-- Soal: hanya instruktur pemilik kursus dan admin yang bisa melihat tabel soal asli (termasuk kunci_jawaban)
DROP POLICY IF EXISTS "Instruktur see own soal" ON public.soal;
CREATE POLICY "Instruktur see own soal" ON public.soal FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.modul m 
    JOIN public.kursus k ON k.id = m.kursus_id 
    WHERE m.id = modul_id AND (k.instruktur_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Instruktur edit draf soal" ON public.soal;
CREATE POLICY "Instruktur edit draf soal" ON public.soal FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.modul m 
    JOIN public.kursus k ON k.id = m.kursus_id 
    WHERE m.id = modul_id AND k.instruktur_id = auth.uid() AND k.status = 'draf'
  )
);

DROP POLICY IF EXISTS "Admin manage soal" ON public.soal;
CREATE POLICY "Admin manage soal" ON public.soal FOR ALL USING (public.is_admin());

-- Pendaftaran: peserta melihat pendaftaran miliknya, instruktur melihat pendaftaran di kursusnya, admin melihat semua
DROP POLICY IF EXISTS "Peserta read own pendaftaran" ON public.pendaftaran;
CREATE POLICY "Peserta read own pendaftaran" ON public.pendaftaran FOR SELECT 
USING (
  peserta_id = auth.uid() 
  OR EXISTS (SELECT 1 FROM public.kursus k WHERE k.id = kursus_id AND k.instruktur_id = auth.uid())
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Peserta enroll pendaftaran" ON public.pendaftaran;
CREATE POLICY "Peserta enroll pendaftaran" ON public.pendaftaran FOR INSERT 
WITH CHECK (peserta_id = auth.uid());

DROP POLICY IF EXISTS "Peserta cancel unpaid pendaftaran" ON public.pendaftaran;
CREATE POLICY "Peserta cancel unpaid pendaftaran" ON public.pendaftaran FOR UPDATE 
USING (peserta_id = auth.uid() AND status = 'menunggu_bayar')
WITH CHECK (status = 'dibatalkan');

DROP POLICY IF EXISTS "Admin manage pendaftaran" ON public.pendaftaran;
CREATE POLICY "Admin manage pendaftaran" ON public.pendaftaran FOR ALL USING (public.is_admin());

-- Progres Modul: peserta melihat miliknya
DROP POLICY IF EXISTS "Peserta view and update own progress" ON public.progres_modul;
CREATE POLICY "Peserta view and update own progress" ON public.progres_modul FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id AND (p.peserta_id = auth.uid() OR public.is_admin()))
);

-- Percobaan Kuis: peserta melihat riwayat kuis sendiri
DROP POLICY IF EXISTS "Peserta view own kuis" ON public.percobaan_kuis;
CREATE POLICY "Peserta view own kuis" ON public.percobaan_kuis FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id AND (p.peserta_id = auth.uid() OR public.is_admin()))
);

-- Sertifikat: pemilik sertifikat dan admin
DROP POLICY IF EXISTS "Read sertifikat" ON public.sertifikat;
CREATE POLICY "Read sertifikat" ON public.sertifikat FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.pendaftaran p WHERE p.id = pendaftaran_id AND (p.peserta_id = auth.uid() OR public.is_admin()))
);

-- Audit Log: hanya admin
DROP POLICY IF EXISTS "Admin see audit log" ON public.audit_log;
CREATE POLICY "Admin see audit log" ON public.audit_log FOR SELECT USING (public.is_admin());
""")

    content = "\n".join(out)
    with open('supabase/setup_complete.sql', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Generated supabase/setup_complete.sql ({len(content)} bytes)")

if __name__ == '__main__':
    main()
