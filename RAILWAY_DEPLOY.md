# 🚀 Cara Deploy 9Router di Railway — Panduan Lengkap untuk Pengguna

Panduan ini mengantar kamu dari **nol** sampai punya **dashboard 9Router yang jalan sendiri**
plus **endpoint API bergaya OpenAI** (`/v1`) yang bisa dipakai di aplikasi apa pun.

**Waktu:** 15–30 menit · **Modal:** akun GitHub + akun Railway + HP/laptop

---

## 1. Apa yang akan kamu dapat

- Dashboard web pribadi (login dengan password yang kamu tentukan sendiri)
- Endpoint `https://<domain-kamu>/v1` — kompatibel dengan OpenAI, jadi bisa dipakai di aplikasi atau
  agent apa pun
- Database & konfigurasi tersimpan permanen di server (tidak hilang saat update)

---

## 2. Ambil kodenya (fork)

1. Buka repo ini di GitHub → tombol **Fork** (kanan atas) → **Create fork**
2. Sekarang kamu punya salinan sendiri di akun GitHub-mu — semua perubahan nanti di repo itu

> Repo ini **sudah lengkap**: ada `Dockerfile`, `custom-server.js`, `start.sh`, dan adapter SQLite-nya.
> Kamu **tidak perlu** meng-upload berkas apa pun secara manual.

---

## 3. Buat project di Railway

1. Buka **railway.app** → **New Project**
2. Pilih **Deploy from GitHub repo** → sambungkan akun GitHub-mu kalau diminta
3. Pilih repo hasil fork tadi
4. Railway akan mulai build. Kalau dia salah mendeteksi jenis build:
   **Settings → Build → Builder: pilih `Dockerfile`** (jangan Nixpacks)
5. **Settings → Deploy → Start Command: KOSONGKAN** (Dockerfile sudah mengatur perintah jalannya)
6. **Jangan menaikkan jumlah replika (Replicas)** — tetap **1**
   (aplikasi ini memakai database SQLite; dua replika = dua penulis ke satu berkas)

---

## 4. Isi Environment Variables

Masuk **Variables** → tambahkan satu per satu.

### Wajib

| Nama | Nilai |
|---|---|
| `PORT` | `20128` |
| `HOSTNAME` | `0.0.0.0` |
| `NODE_ENV` | `production` |
| `DATA_DIR` | `/app/data` |
| `JWT_SECRET` | string acak panjang — `openssl rand -hex 32` |
| `INITIAL_PASSWORD` | **password login dashboard-mu** (tentukan sendiri) |
| `API_KEY_SECRET` | string acak panjang — `openssl rand -hex 32` |
| `MACHINE_ID_SALT` | string acak — `openssl rand -hex 16` |
| `AUTH_COOKIE_SECURE` | `true` |

### Disarankan

| Nama | Nilai |
|---|---|
| `REQUIRE_API_KEY` | `true` (semua endpoint wajib API key, lebih aman) |
| `OBSERVABILITY_ENABLED` | `true` |
| `ENABLE_REQUEST_LOGS` | `false` (nyalakan `true` hanya saat menelusuri masalah) |
| `NEXT_TELEMETRY_DISABLED` | `1` |

> Bingung membuat string acak? Di Termux/Linux: `openssl rand -hex 32`. Kalau tidak ada, ketik saja
> kalimat acak **panjang** (30+ karakter) yang tidak kamu pakai di tempat lain — yang penting
> **jangan pendek** dan **jangan dibagikan**.

### Setelah deploy pertama — langkah yang paling sering terlewat ⚠️

Domainmu baru ada setelah deploy pertama. Jadi:

1. Buka **Settings → Networking → Generate Domain** → salin URL-nya
   (mis. `https://9router-xxx.up.railway.app`)
2. Kembali ke **Variables**, tambahkan **empat** ini dengan URL tersebut:
   ```
   BASE_URL=https://9router-xxx.up.railway.app
   NEXT_PUBLIC_BASE_URL=https://9router-xxx.up.railway.app
   CLOUD_URL=https://9router-xxx.up.railway.app
   NEXT_PUBLIC_CLOUD_URL=https://9router-xxx.up.railway.app
   ```
3. **Redeploy** — wajib, karena nilai `NEXT_PUBLIC_*` ikut ditanam saat build
   (kalau tidak, perubahan itu tidak berpengaruh)

---

## 5. Pasang penyimpanan permanen (Volume)

Tanpa ini, **semua data hilang** setiap kali deploy ulang (provider, API key, akun, database).

1. Di project Railway-mu → **+ Add Volume** (atau **Create → Volume**)
2. **Mount path:** `/app/data` — harus persis ini
3. Klik **Add** → lalu **redeploy**

> Izin berkas sudah diurus otomatis oleh image-nya — kamu **tidak perlu** mengubah permission manual.

---

## 6. Set port & buka domain

1. **Settings → Networking** → pastikan **port target = `20128`**
   (harus sama dengan nilai `PORT` di langkah 4)
2. Klik **Generate Domain** → kamu dapat URL publik
3. Buka URL itu di browser → halaman login muncul

---

## 7. Login & pakai

1. **Login** dengan `INITIAL_PASSWORD` yang kamu isi di langkah 4
2. **Segera ganti password** dari dalam dashboard (menu Settings/Profil)
3. **Providers** → tambahkan penyedia AI-mu (tempel API key/akun sesuai yang kamu punya)
4. **Endpoint / API Keys** → salin API key milikmu

**Pakai di aplikasi mana pun (OpenAI-compatible):**

```
Base URL : https://<domain-railway-kamu>/v1
API Key  : <key dari dashboard>
Model    : <nama model yang kamu aktifkan>
```

Contoh uji cepat dari Termux:

```bash
curl -s https://<domain-railway-kamu>/v1/chat/completions \
  -H "Authorization: Bearer <API_KEY_KAMU>" \
  -H "Content-Type: application/json" \
  -d '{"model":"<nama-model>","messages":[{"role":"user","content":"halo"}],"max_tokens":16}'
```

Kalau balasannya berisi `choices` — semuanya sudah benar.

---

## 8. Hal yang wajib dihindari

| Jangan | Alasannya |
|---|---|
| Menambah replika / menjalankan 2 instance dengan volume yang sama | SQLite tidak untuk dua penulis bersamaan — data bisa rusak |
| Commit berkas `.env` ke GitHub | rahasia bisa bocor |
| Memakai `JWT_SECRET`/password bawaan | gampang ditebak |
| Menghapus Volume untuk "membersihkan" | seluruh data pelanggan/config ikut hilang |
| Mengganti `NEXT_PUBLIC_*` tanpa redeploy | nilainya ditanam saat build — perubahan tidak akan terpakai |

---

## 9. Kalau ada masalah

| Gejala | Solusi |
|---|---|
| Build gagal menyebut `better-sqlite3` / `node-gyp` | Builder bukan Dockerfile → **Settings → Build → Builder = Dockerfile** |
| Build mati / kehabisan memori di tengah jalan | build Next.js memang berat → **Redeploy**; kalau sering, naikkan memori builder di plan Railway |
| Bisa buka domain tapi tidak bisa login | pastikan `INITIAL_PASSWORD` terisi tanpa spasi dan `JWT_SECRET` terisi |
| Data hilang setiap deploy ulang | Volume belum terpasang di **`/app/data`** |
| Halaman jalan, tapi API/sinkron gagal | `BASE_URL` + `NEXT_PUBLIC_BASE_URL` belum menunjuk ke domain ini (lalu redeploy) |
| Login berhasil sebentar lalu keluar sendiri | `AUTH_COOKIE_SECURE` harus `true` (Railway HTTPS) |
| Perubahan setting tidak berpengaruh | redeploy dengan **Clear build cache** |

---

## 10. Soal biaya & keberlanjutan (baca ini)

- Railway memberi **kuota percobaan**. Kalau kuota itu habis, **service-mu akan berhenti** sampai kamu
  upgrade ke plan berbayar. Jadi **jangan andalkan kuota percobaan untuk produksi jangka panjang**.
- Data tetap aman selama **Volume** tetap ada — kalau service berhenti, kamu bisa menyalakannya lagi
  tanpa kehilangan konfigurasi (tapi tetap: **jangan hapus Volume**).
- Kalau kamu ingin biaya tetap dan kontrol penuh, jalur lanjutan yang umum adalah
  **VPS sendiri + Docker Compose + Cloudflare Tunnel** (repo ini sudah menyertakan
  `docker-compose.yml`). Tutorial Railway ini yang paling cepat untuk mulai.

---

## 11. Update versi baru

1. Sinkronkan fork-mu dengan repo sumber (GitHub → **Sync fork**), atau tarik perubahan ke salinanmu
2. Railway akan mendeteksi push & **auto-deploy**
3. Kalau terasa build-nya "tidak ikut berubah" → **Redeploy → Clear build cache**
4. **Sebelum update besar:** unduh dulu salinan isi `/app/data` (seluruh state-mu ada di situ)

---

## 12. Mengulang gratis: rotasi akun Railway (khusus 9Router)

Dengan kuota percobaan Railway, service biasanya bertahan sekitar **1 bulan** lalu berhenti.
Untuk melanjutkan **tanpa membayar**, alurnya begini — dan **bagian A wajib dikerjakan lebih awal**,
karena begitu service berhenti kamu tidak bisa lagi mengambil datanya dengan mudah.

### A. Selagi service masih hidup (lakukan sejak awal, jangan menunggu)

Seluruh state-mu ada di **`/app/data`**:

```text
/app/data/
├── db/
│   ├── data.sqlite     # database utama (akun, provider, API key, konfigurasi)
│   └── backups/        # backup keamanan saat migrasi skema — BUKAN backup harian
└── ...                 # sertifikat, log, konfigurasi runtime
```

> Perhatikan: folder `backups/` itu **hanya** dibuat saat aplikasi mengubah skema database.
> Dia **bukan** backup harian otomatis. Jadi **salinan rutin tetap tanggung jawabmu**.

Amankan isi `/app/data` dengan salah satu cara berikut (tergantung fitur plan Railway-mu):

1. **Lewat access shell** kalau tersedia (Railway CLI: `railway login` → `railway link` → `railway ssh`):
   ```bash
   tar czf /tmp/9router-data.tgz -C /app/data .
   # lalu unduh berkas itu (atau tampilkan base64 kalau ukurannya kecil)
   ```
2. **Lewat fitur Volume/Backup di dashboard Railway**, kalau plan-mu menyediakannya
   (buka service → Volume → cari opsi ekspor/backup).
3. **Kalau tidak ada akses apa pun**: mulai sekarang biasakan **menyimpan konfigurasi penting di
   catatanmu sendiri** (daftar provider + API key) — itu bagian tersulit untuk diingat ulang.

Simpan salinan itu **di luar Railway** (Google Drive, HP, dsb). Jadwalkan tiap 1–2 minggu.

### B. Kalau kuota sudah habis

1. Buat **akun Railway baru** (email lain) → **New Project → Deploy from GitHub repo** → pilih fork-mu
2. Isi **environment variables yang sama** (langkah 4) — simpan daftarnya sejak awal agar tinggal tempel
3. Pasang **Volume baru** di mount path `/app/data` → klik **Add** → **Redeploy**
4. **Generate Domain** baru → perbarui `BASE_URL` + `NEXT_PUBLIC_BASE_URL` + `CLOUD_URL` +
   `NEXT_PUBLIC_CLOUD_URL` ke domain baru → **Redeploy** (wajib, karena `NEXT_PUBLIC_*` ditanam saat build)
5. Login dengan `INITIAL_PASSWORD` yang sama seperti sebelumnya
6. Kalau kamu punya salinan data dari langkah A: kembalikan isinya ke `/app/data`
   (dengan cara yang sama seperti mengekspornya) → **Redeploy** → semua konfigurasi kembali

### C. Kalau data tidak sempat disalin

Tidak fatal untuk pemakaian pribadi: isi ulang provider + API key dari dashboard (sekitar 10 menit).

> ⚠️ **Untuk operator yang menjual akses:** akun/pelanggan yang tersimpan di database **tidak bisa
> dipulihkan** kalau tidak ada salinan. Jadi **jangan pernah** menunggu kuota hampir habis —
> biasakan ekspor rutin, dan simpan salinannya di dua tempat berbeda.

### D. Ringkasan siklus (1 bulan sekali)

```text
hari 1      : deploy + isi env + volume + domain + BASE_URL  → jalan
hari 1-30   : pakai seperti biasa; EKSPOR /app/data tiap 1-2 minggu
kuota habis : service berhenti (data di volume lama masih ada, tapi sulit diambil)
hari 31     : akun Railway baru → deploy repo yang sama → volume baru → env sama
              → masukkan kembali salinan data → domain baru → perbarui 4 variabel URL → redeploy
```

> Kalau kamu ingin berhenti mengulang siklus ini, jalur **VPS sendiri** (bagian 10) memberi biaya
> tetap, data sepenuhnya di tanganmu, dan tidak ada rotasi akun.

---

## Checklist singkat

- [ ] Akun GitHub & akun Railway siap
- [ ] Repo sudah di-fork
- [ ] 9 Variables wajib terisi (termasuk 2 string acak panjang)
- [ ] Volume terpasang di `/app/data`
- [ ] Domain sudah di-generate + 4 variabel `*_URL` menunjuk domain itu + redeploy
- [ ] Password dashboard sudah diganti
- [ ] Provider sudah ditambahkan + API key sudah disalin
- [ ] (Pemakai kuota gratis) salinan `/app/data` sudah disimpan di luar Railway + daftar environment variables dicatat

---

## Lampiran: `railway.toml` (opsional, supaya setelan deploy tersimpan di repo)

Tambahkan berkas ini di root repo, agar setelan builder tidak perlu diatur ulang dari UI:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
# Start Command dikosongkan: pakai ENTRYPOINT/CMD dari Dockerfile.
startCommand = ""
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

> `healthcheckPath` sengaja tidak dipakai: Railway menghitung hanya HTTP **200**, sedangkan halaman
> dashboard bisa membalas redirect/login — salah setel di sini membuat deploy dinyatakan gagal
> padahal aplikasinya berjalan normal.
