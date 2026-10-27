import urllib.request
import json
import ssl
import sys

# Load env
with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

url = env.get('NEXT_PUBLIC_SUPABASE_URL')
key = env.get('SUPABASE_SERVICE_ROLE_KEY')

if not url or not key:
    print("Missing Supabase credentials in .env.local")
    sys.exit(1)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation'
}

def api_call(endpoint, method='GET', data=None):
    full_url = f'{url}/rest/v1/{endpoint}'
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(full_url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"HTTP Error {e.code} on {endpoint}: {err_msg}")
        return None
    except Exception as e:
        print(f"Error on {endpoint}: {e}")
        return None

# Load course data from build_courses_data
from build_courses_data import courses_data

print("1. Updating all courses to nilai_lulus = 60...")
for c in courses_data:
    res = api_call(f"kursus?id=eq.{c['id']}", method='PATCH', data={'nilai_lulus': 60})
    if res is not None:
        print(f"  -> Kursus {c['judul']} updated (nilai_lulus = 60)")

print("\n2. Syncing 10 modules for each course...")
# Mapping index format kursus ID -> modul prefix
# Excel: 00000000-0000-4000-c000-00000100000X
# Canva: 00000000-0000-4000-c000-00000200000X
# English: 00000000-0000-4000-c000-00000300000X
# Pembukuan: 00000000-0000-4000-c000-00000400000X
course_idx_map = {
    "00000000-0000-4000-b000-000000000001": 1,
    "00000000-0000-4000-b000-000000000002": 2,
    "00000000-0000-4000-b000-000000000003": 3,
    "00000000-0000-4000-b000-000000000004": 4,
}

for c in courses_data:
    kid = c["id"]
    if kid not in course_idx_map:
        continue
    c_num = course_idx_map[kid]
    print(f"\nProcessing modules for: {c['judul']}")
    
    # Ambil modul yang sudah ada di DB
    existing_moduls = api_call(f"modul?kursus_id=eq.{kid}&order=urutan.asc") or []
    existing_by_urutan = {m["urutan"]: m for m in existing_moduls}
    
    for m in c["modul"]:
        u = m["urutan"]
        # Format ID: misal 00000000-0000-4000-c000-000001000001 s.d. 00000000-0000-4000-c000-000001000010
        modul_id = f"00000000-0000-4000-c000-00000{c_num:01d}{u:06d}"
        
        modul_payload = {
            "kursus_id": kid,
            "urutan": u,
            "judul": m["judul"],
            "isi_materi": m["isiMateri"],
            "video_url": m.get("videoUrl"),
            "lampiran_path": m.get("lampiranPath"),
            "durasi_menit": m["durasiMenit"]
        }
        
        if u in existing_by_urutan:
            # Update modul yang sudah ada
            target_id = existing_by_urutan[u]["id"]
            api_call(f"modul?id=eq.{target_id}", method='PATCH', data=modul_payload)
            modul_id = target_id
            print(f"  [Urutan {u}] Updated existing modul {modul_id}")
        else:
            # Insert modul baru
            modul_payload["id"] = modul_id
            api_call("modul", method='POST', data=modul_payload)
            print(f"  [Urutan {u}] Inserted new modul {modul_id}")
            
        # 3. Sync soal untuk modul ini
        if "soal" in m and m["soal"]:
            # Cek soal yang sudah ada
            existing_soal = api_call(f"soal?modul_id=eq.{modul_id}&order=urutan.asc") or []
            existing_soal_by_urutan = {s["urutan"]: s for s in existing_soal}
            
            for s in m["soal"]:
                su = s["urutan"]
                soal_id = f"00000000-0000-4000-d000-{c_num:04d}{u:04d}{su:04d}"
                soal_payload = {
                    "modul_id": modul_id,
                    "urutan": su,
                    "pertanyaan": s["pertanyaan"],
                    "pilihan_a": s["pilihan_a"],
                    "pilihan_b": s["pilihan_b"],
                    "pilihan_c": s["pilihan_c"],
                    "pilihan_d": s["pilihan_d"],
                    "kunci_jawaban": s["kunci_jawaban"]
                }
                
                if su in existing_soal_by_urutan:
                    sid = existing_soal_by_urutan[su]["id"]
                    api_call(f"soal?id=eq.{sid}", method='PATCH', data=soal_payload)
                else:
                    soal_payload["id"] = soal_id
                    api_call("soal", method='POST', data=soal_payload)

print("\nSync completed successfully to Supabase!")
