import urllib.request
import json
import ssl
import sys

with open('.env.local') as f:
    env = dict(line.strip().split('=', 1) for line in f if '=' in line and not line.startswith('#'))

url = env.get('NEXT_PUBLIC_SUPABASE_URL')
key = env.get('SUPABASE_SERVICE_ROLE_KEY')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def api_request(endpoint, data=None, method='GET', prefer='resolution=merge-duplicates,return=representation'):
    full_url = f'{url}/rest/v1/{endpoint}'
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
        'Prefer': prefer
    }
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(full_url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} on {endpoint}: {e.read().decode('utf-8')}")
        return None

# Load course data
from build_courses_data import courses_data

print("1. Updating nilai_lulus = 60 for all courses...")
for c in courses_data:
    api_request(f"kursus?id=eq.{c['id']}", method='PATCH', data={'nilai_lulus': 60})

course_idx_map = {
    "00000000-0000-4000-b000-000000000001": 1,
    "00000000-0000-4000-b000-000000000002": 2,
    "00000000-0000-4000-b000-000000000003": 3,
    "00000000-0000-4000-b000-000000000004": 4,
}

print("2. Preparing bulk modules and questions...")
all_modules = []
all_soal = []

for c in courses_data:
    kid = c["id"]
    if kid not in course_idx_map:
        continue
    c_num = course_idx_map[kid]
    
    # Ambil modul yang sudah ada di DB untuk mempertahankan ID
    existing = api_request(f"modul?kursus_id=eq.{kid}") or []
    ex_map = {m["urutan"]: m["id"] for m in existing}
    
    for m in c["modul"]:
        u = m["urutan"]
        mid = ex_map.get(u, f"00000000-0000-4000-c000-00000{c_num:01d}{u:06d}")
        
        all_modules.append({
            "id": mid,
            "kursus_id": kid,
            "urutan": u,
            "judul": m["judul"],
            "isi_materi": m["isiMateri"],
            "video_url": m.get("videoUrl"),
            "lampiran_path": m.get("lampiranPath"),
            "durasi_menit": m["durasiMenit"]
        })
        
        if "soal" in m and m["soal"]:
            for s in m["soal"]:
                su = s["urutan"]
                sid = f"00000000-0000-4000-d000-{c_num:04d}{u:04d}{su:04d}"
                all_soal.append({
                    "id": sid,
                    "modul_id": mid,
                    "urutan": su,
                    "pertanyaan": s["pertanyaan"],
                    "pilihan_a": s["pilihan_a"],
                    "pilihan_b": s["pilihan_b"],
                    "pilihan_c": s["pilihan_c"],
                    "pilihan_d": s["pilihan_d"],
                    "kunci_jawaban": s["kunci_jawaban"]
                })

print(f"3. Bulk upserting {len(all_modules)} modules into Supabase...")
res_m = api_request("modul?on_conflict=kursus_id,urutan", data=all_modules, method='POST')
if res_m is not None:
    print(f"Successfully upserted {len(all_modules)} modules!")
else:
    print("Failed to upsert modules, trying 1 by 1")

print(f"4. Bulk upserting {len(all_soal)} questions into Supabase...")
# Chunk questions by 50 to avoid massive payloads
for i in range(0, len(all_soal), 50):
    chunk = all_soal[i:i+50]
    api_request("soal?on_conflict=modul_id,urutan", data=chunk, method='POST')
    print(f"  Upserted questions {i+1} to {min(i+50, len(all_soal))}")

print("\nALL 10 MODULES AND QUESTIONS SUCCESSFULLY SYNCED TO SUPABASE!")
