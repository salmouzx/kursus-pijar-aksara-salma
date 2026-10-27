**Bootcamp AI Web Programming · Capstone Project**

PRD Aplikasi LMS Lembaga Kursus

**Lembaga Kursus Pijar Aksara**

## **1\. Latar Belakang**

Lembaga Kursus Pijar Aksara di Depok menyelenggarakan kursus singkat untuk pekerja kantor dan pelaku UMKM, misalnya Excel, desain konten, bahasa Inggris kerja, dan pembukuan. Selama ini kursus berjalan lewat grup WhatsApp dan Google Drive. Akibatnya sering terjadi:

* calon peserta sulit menemukan informasi kursus, harga, dan sisa kursi;

* jumlah peserta melebihi kuota kelas karena pendaftaran dicatat manual;

* file materi tersebar dan bisa dibagikan ke orang yang tidak membayar;

* kuis dikerjakan lewat Google Form, kunci jawaban mudah bocor, dan nilai direkap manual;

* sertifikat dibuat satu per satu di aplikasi desain sehingga nomornya sering dobel.

Aplikasi LMS ini menggantikan cara tersebut dengan katalog kursus publik, pendaftaran online dengan kuota, materi per modul, kuis pilihan ganda yang dinilai otomatis, progres belajar, dan sertifikat sederhana.

## **2\. Tujuan**

1. Calon peserta menemukan kursus Pijar Aksara lewat Google dan melihat harga serta sisa kursi.

2. Jumlah peserta satu kursus tidak pernah melebihi kuota, termasuk saat banyak orang mendaftar bersamaan.

3. Materi hanya bisa dibuka peserta yang terdaftar, berurutan per modul.

4. Kuis dinilai otomatis, kunci jawaban tidak pernah terlihat peserta, dan jumlah percobaan dibatasi.

5. Peserta yang menyelesaikan semua modul langsung mendapat sertifikat bernomor unik.

6. Admin melihat pendaftaran, pendapatan, dan tingkat penyelesaian kursus dalam satu dashboard.

## **3\. Pengguna dan Peran**

| Peran | Siapa | Yang bisa dilakukan |
| :---- | :---- | :---- |
| Peserta | Orang yang mendaftar akun sendiri | Mendaftar kursus, membayar (untuk kursus berbayar), membaca materi, mengerjakan kuis, melihat progres dan nilai sendiri, mengunduh sertifikat sendiri |
| Instruktur | Pengajar yang ditunjuk admin | Membuat dan menyusun kursus miliknya (modul, materi, soal), mengajukan kursus untuk ditinjau, melihat peserta dan nilai kuis di kursus miliknya saja |
| Admin | Staf pengelola lembaga | Meninjau, menerbitkan, mengembalikan, menutup, dan membuka kembali kursus; mengubah harga dan kuota; mengonfirmasi pembayaran; membatalkan pendaftaran; mengelola peran akun; melihat semua data, dashboard, dan *audit log* |

Pengunjung yang belum masuk hanya bisa melihat Katalog Kursus dan Detail Kursus. Akun baru selalu berperan Peserta. Peran Instruktur dan Admin hanya diberikan oleh Admin.

## **4\. Aturan Bisnis**

| Kode | Aturan |
| :---- | :---- |
| BR-01 | Katalog publik hanya menampilkan kursus berstatus terbit. Kursus draf, ditinjau, dan ditutup tidak tampil di katalog dan tidak bisa dibuka lewat alamat langsung oleh pengunjung. |
| BR-02 | Status kursus: draf, ditinjau, terbit, ditutup. Hanya instruktur pemilik yang boleh mengajukan kursus (draf ke ditinjau). Hanya admin yang boleh menerbitkan, mengembalikan ke draf, menutup, dan membuka kembali. Pengembalian ke draf wajib disertai catatan minimal 10 karakter. Kursus terbit tidak bisa kembali ke draf. |
| BR-03 | Kursus hanya bisa diajukan bila memiliki 2 sampai 10 modul dengan nomor urut 1, 2, 3 dan seterusnya tanpa lompatan, dan setiap modul memiliki 3 sampai 20 soal. Harga kursus Rp0 (gratis) atau Rp50.000 sampai Rp5.000.000. Kuota 1 sampai 100 peserta. Nilai lulus kuis 50 sampai 100, bawaan 70\. |
| BR-04 | Modul, materi, dan soal hanya bisa ditambah, diubah, atau dihapus saat kursus berstatus draf. Setelah diajukan, isi kursus terkunci, termasuk untuk admin. |
| BR-05 | Hanya akun berperan Peserta yang bisa mendaftar, dan hanya ke kursus terbit. Satu peserta hanya boleh punya satu pendaftaran yang masih berlaku (menunggu bayar, aktif, atau selesai) per kursus. Peserta boleh mendaftar lagi bila pendaftaran sebelumnya kedaluwarsa atau dibatalkan. |
| BR-06 | Kursi terpakai dihitung dari pendaftaran aktif, selesai, dan menunggu bayar yang belum lewat batas. Pendaftaran ditolak bila kursi terpakai sudah sama dengan kuota. Dua orang yang mendaftar bersamaan pada kursi terakhir tidak boleh sama-sama berhasil. Admin boleh mengubah kuota kursus terbit, tetapi tidak boleh lebih kecil dari kursi terpakai. |
| BR-07 | Kursus gratis langsung aktif saat mendaftar. Kursus berbayar berstatus menunggu bayar dengan batas bayar 24 jam. Status menjadi aktif hanya setelah admin mengonfirmasi pembayaran sebelum batas, atau setelah kabar pembayaran dari *payment gateway* diterima dan diperiksa. Lewat batas, pendaftaran menjadi kedaluwarsa dan kursinya kembali. Peserta hanya boleh membatalkan pendaftaran yang belum dibayar. Admin boleh membatalkan pendaftaran aktif dengan alasan minimal 10 karakter. |
| BR-08 | Materi hanya bisa dibuka peserta dengan pendaftaran aktif atau selesai. Modul 1 langsung terbuka. Modul berikutnya terbuka setelah kuis modul sebelumnya lulus. Kuis sebuah modul baru bisa dibuka setelah peserta menekan tombol "Tandai materi sudah dibaca" pada modul itu. |
| BR-09 | Kuis berupa pilihan ganda A sampai D dan semua soal wajib dijawab. Nilai \= jumlah benar dibagi jumlah soal dikali 100, dibulatkan ke bawah. Lulus bila nilai sama dengan atau lebih dari nilai lulus kursus. Penilaian dilakukan di server. Kunci jawaban tidak pernah dikirim ke peserta, baik sebelum maupun sesudah kuis. Peserta hanya melihat nilai dan jumlah jawaban benar. |
| BR-10 | Setiap modul paling banyak 3 percobaan kuis per pendaftaran. Setelah lulus, kuis modul itu tidak bisa dikerjakan lagi. Dua kiriman kuis yang terjadi bersamaan tidak boleh menghasilkan percobaan keempat. |
| BR-11 | Progres \= modul lulus dibagi jumlah modul dikali 100%. Saat semua modul lulus, pendaftaran otomatis menjadi selesai dan sertifikat terbit otomatis. Satu pendaftaran hanya punya satu sertifikat. Nomor sertifikat berformat PA-TAHUN-NOMOR (contoh PA-2026-0001), berurutan per tahun, tidak boleh dobel. Sertifikat memuat nama peserta, judul kursus, dan tanggal selesai. |
| BR-12 | Nilai kuis dan data peserta (nama, email, nomor HP, progres) hanya boleh dilihat peserta itu sendiri, instruktur pemilik kursus terkait, dan admin. Instruktur tidak bisa melihat peserta kursus instruktur lain. Peserta tidak bisa melihat daftar atau nilai peserta lain. Perubahan status kursus, perubahan harga atau kuota, konfirmasi pembayaran, pembatalan pendaftaran, dan perubahan peran akun tercatat di *audit log*. Admin tidak boleh menurunkan peran atau menonaktifkan akunnya sendiri. |

## **5\. User Story**

| Kode | User story | Aturan terkait |
| :---- | :---- | :---- |
| US-01 | Sebagai pengunjung, saya ingin melihat katalog dan detail kursus (silabus, harga, sisa kursi, instruktur) agar bisa memilih kursus. | BR-01, BR-06 |
| US-02 | Sebagai peserta, saya ingin mendaftar kursus gratis atau berbayar dan melihat status pendaftaran saya. | BR-05, BR-06, BR-07 |
| US-03 | Sebagai peserta, saya ingin membaca materi per modul secara berurutan, termasuk video dan file PDF. | BR-08 |
| US-04 | Sebagai peserta, saya ingin mengerjakan kuis dan langsung melihat nilai serta sisa percobaan. | BR-09, BR-10 |
| US-05 | Sebagai peserta, saya ingin melihat progres belajar dan mengunduh sertifikat setelah selesai. | BR-11 |
| US-06 | Sebagai instruktur, saya ingin menyusun kursus, modul, materi, dan soal, lalu mengajukannya untuk ditinjau. | BR-02, BR-03, BR-04 |
| US-07 | Sebagai instruktur, saya ingin melihat peserta, progres, dan nilai kuis di kursus saya. | BR-12 |
| US-08 | Sebagai admin, saya ingin meninjau kursus lalu menerbitkan, mengembalikan dengan catatan, menutup, atau membuka kembali. | BR-01, BR-02, BR-12 |
| US-09 | Sebagai admin, saya ingin mengonfirmasi pembayaran, membatalkan pendaftaran, mengubah kuota, dan mengelola peran akun. | BR-06, BR-07, BR-12 |
| US-10 | Sebagai admin, saya ingin melihat dashboard pendaftaran, pendapatan, dan tingkat penyelesaian kursus. | BR-06, BR-11 |

## **6\. Alur Status**

### **6.1 Status Kursus**

| Dari | Ke | Siapa | Syarat |
| :---- | :---- | :---- | :---- |
| (baru) | draf | Instruktur | Kursus baru selalu draf |
| draf | ditinjau | Instruktur pemilik | Memenuhi BR-03 |
| ditinjau | terbit | Admin | Tampil di katalog |
| ditinjau | draf | Admin | Catatan pengembalian minimal 10 karakter |
| terbit | ditutup | Admin | Hilang dari katalog, pendaftaran baru ditolak, peserta lama tetap belajar |
| ditutup | terbit | Admin | Tampil lagi di katalog |

Perpindahan lain ditolak, misalnya draf langsung ke terbit, ditinjau ke ditutup, atau terbit ke draf.

### **6.2 Status Pendaftaran**

| Dari | Ke | Siapa | Syarat |
| :---- | :---- | :---- | :---- |
| (baru) | aktif | Peserta | Kursus gratis, kuota masih ada |
| (baru) | menunggu\_bayar | Peserta | Kursus berbayar, kuota masih ada, batas bayar 24 jam |
| menunggu\_bayar | aktif | Admin atau sistem pembayaran | Dibayar sebelum batas bayar |
| menunggu\_bayar | kedaluwarsa | Sistem | Batas bayar lewat |
| menunggu\_bayar | dibatalkan | Peserta pemilik atau Admin | Belum dibayar |
| aktif | dibatalkan | Admin | Alasan minimal 10 karakter |
| aktif | selesai | Sistem | Semua modul lulus, sertifikat terbit |

Status selesai, kedaluwarsa, dan dibatalkan adalah status akhir dan tidak bisa diubah lagi.

## **7\. Halaman**

| Halaman | Akses | Isi |
| :---- | :---- | :---- |
| Katalog Kursus | Publik (terindeks Google) | Daftar kursus terbit, filter kategori, harga atau label Gratis, sisa kursi, nama instruktur |
| Detail Kursus | Publik (terindeks Google) | Deskripsi, silabus (judul dan durasi modul saja), harga, sisa kursi, tombol Daftar |
| Masuk dan Daftar | Publik | Daftar dengan nama, email, nomor HP, kata sandi |
| Kursus Saya | Peserta | Daftar pendaftaran, status, batas bayar, tombol batal (belum dibayar), progres, tombol Lanjut Belajar, tombol Lihat Sertifikat (versi cetak) |
| Ruang Belajar | Peserta terdaftar | Daftar modul (terkunci atau terbuka), materi, video, lampiran PDF, tombol "Tandai materi sudah dibaca", kuis, nilai, sisa percobaan |
| Kelola Kursus | Instruktur | Kursus milik sendiri, formulir kursus, modul, materi, soal, tombol Ajukan, catatan pengembalian dari admin |
| Peserta dan Nilai | Instruktur pemilik, Admin | Tabel peserta per kursus: nama, email, status, progres, nilai terbaik dan jumlah percobaan per modul |
| Panel Admin | Admin | Tab Tinjauan Kursus (tombol status), Pendaftaran dan Pembayaran (konfirmasi, batal), Pengguna (ubah peran, nonaktifkan), *Audit Log* |
| Dashboard | Admin | Kartu ringkasan dan grafik (lihat bagian 9\) |

Masuk dan Daftar tidak dihitung dalam jumlah halaman. Semua halaman selain Katalog Kursus dan Detail Kursus wajib *noindex*.

## **8\. Data Utama**

Rincian tabel, kolom, dan relasi ada di file **ERD\_LMS.pdf**. Ringkasnya:

| Data | Isi penting |
| :---- | :---- |
| Profil akun | nama lengkap, email, nomor HP, peran, status aktif |
| Kursus | instruktur, judul, *slug*, kategori, ringkasan, deskripsi, harga, kuota, nilai lulus, status, catatan tinjauan |
| Modul | kursus, nomor urut, judul, isi materi, tautan video, lampiran PDF, durasi |
| Soal | modul, nomor urut, pertanyaan, pilihan A sampai D, kunci jawaban (rahasia) |
| Pendaftaran | kursus, peserta, status, nominal, cara bayar, batas bayar, waktu bayar, pengonfirmasi, alasan batal |
| Progres modul | pendaftaran, modul, waktu materi dibaca, waktu lulus |
| Percobaan kuis | pendaftaran, modul, nomor percobaan, jawaban, jumlah benar, nilai, lulus |
| Sertifikat | pendaftaran, nomor sertifikat, nama peserta, judul kursus, tanggal terbit |
| *Audit log* | pelaku, aksi, data, nilai sebelum, nilai sesudah, waktu |

File materi PDF disimpan di Supabase Storage pada *bucket* privat.

## **9\. Dashboard dan Laporan**

Halaman Dashboard hanya untuk Admin, dengan filter rentang tanggal (bawaan 8 minggu terakhir).

1. Kartu ringkasan: pendaftaran bulan ini, pendapatan bulan ini, peserta aktif, sertifikat terbit.

2. Grafik batang pendaftaran per minggu, dibedakan gratis dan berbayar.

3. Grafik garis pendapatan per minggu (pendaftaran aktif dan selesai yang sudah dibayar).

4. Grafik batang tingkat penyelesaian per kursus (selesai dibagi aktif ditambah selesai).

5. Tabel modul dengan tingkat lulus percobaan pertama terendah, untuk masukan ke instruktur.

6. Tabel kursus hampir penuh (sisa kursi 2 atau kurang).

Instruktur tidak membuka Dashboard; ringkasan kursusnya tampil di halaman Peserta dan Nilai.

## **10\. Kebutuhan Non-Fungsional**

1. Katalog Kursus dan Detail Kursus tampil cepat di ponsel: LCP paling lama 2,5 detik.

2. SEO: Katalog dan Detail Kursus memiliki judul dan deskripsi halaman per kursus, alamat berbasis *slug* (contoh /kursus/excel-administrasi-perkantoran), dan masuk ke *sitemap*. Hanya kursus terbit yang masuk *sitemap*.

3. Ruang Belajar, Kursus Saya, Kelola Kursus, Peserta dan Nilai, Panel Admin, dan Dashboard memakai *noindex* dan tidak masuk *sitemap*.

4. Keamanan: hak akses diperiksa di database, bukan hanya di tampilan. Kunci jawaban tidak pernah ada di data yang dikirim ke *browser*. Lampiran PDF hanya bisa diunduh peserta terdaftar lewat tautan sementara yang berlaku paling lama 60 menit. Ukuran PDF paling besar 10 MB.

5. Aplikasi tetap benar saat 50 peserta mengerjakan kuis bersamaan dan saat beberapa orang memperebutkan kursi terakhir.

6. Database dicadangkan setiap hari.

## **11\. Fitur Nilai Tambah (opsional)**

1. **Pembayaran dengan Mayar untuk kursus berbayar.** Saat peserta mendaftar kursus berbayar, aplikasi membuat tagihan di Mayar (*sandbox* https\://api.mayar.io/hl/v2, POST /invoices/create) dan mengarahkan peserta ke halaman bayar. Saat menerima *webhook* payment.received, aplikasi memeriksa ulang tagihan lewat GET /invoices/{id}, mencocokkan nominal, lalu mengubah pendaftaran menjadi aktif. *Webhook* yang datang dua kali tidak boleh mengubah data dua kali. Tanpa fitur ini, pembayaran dikonfirmasi manual oleh admin (BR-07).

2. **Notifikasi email** saat pendaftaran aktif, saat batas bayar tinggal 3 jam, dan saat sertifikat terbit.

## **12\. Akun Uji dan Data Contoh**

Akun uji dan data contoh ada di file **Data\_Contoh\_LMS.xlsx**. Sheet "Akun Uji" berisi 2 admin, 3 instruktur, dan 30 peserta dengan kata sandi latihan yang sama. Sheet "Petunjuk" menjelaskan urutan impor dan kasus batas yang sengaja dimuat, misalnya kursus dengan sisa 1 kursi, peserta dengan sisa 1 percobaan kuis, dan peserta yang percobaannya sudah habis.

## **13\. Kriteria Selesai**

* ☐ Aplikasi tayang di Netlify dan bisa dibuka dari ponsel.

* ☐ Ketiga peran bisa masuk dengan akun uji dan hanya melihat menu sesuai perannya.

* ☐ Pengunjung bisa membuka Katalog dan Detail Kursus tanpa masuk; kursus draf, ditinjau, dan ditutup tidak tampil (BR-01).

* ☐ Perpindahan status kursus mengikuti tabel 6.1; perpindahan lain ditolak dengan pesan jelas (BR-02).

* ☐ Pengajuan kursus yang modul atau soalnya kurang ditolak (BR-03), dan isi kursus terkunci setelah diajukan (BR-04).

* ☐ Pendaftaran dobel ditolak; dua pendaftar kursi terakhir hanya satu yang berhasil (BR-05, BR-06).

* ☐ Kursus berbayar menunggu bayar 24 jam, lalu aktif setelah konfirmasi atau kedaluwarsa bila lewat batas (BR-07).

* ☐ Modul berikutnya terkunci sampai kuis modul sebelumnya lulus (BR-08).

* ☐ Kunci jawaban tidak muncul di tab Network *browser*; nilai dihitung server dan dibulatkan ke bawah (BR-09).

* ☐ Percobaan keempat ditolak, termasuk bila dua kiriman dilakukan bersamaan (BR-10).

* ☐ Menyelesaikan semua modul menghasilkan status selesai dan sertifikat bernomor berurutan (BR-11).

* ☐ Instruktur lain dan peserta lain tidak bisa melihat nilai dan data peserta, walau memanggil API langsung (BR-12).

* ☐ Setiap aksi sensitif tercatat di *audit log* dan bisa dilihat admin (BR-12).

* ☐ Dashboard menampilkan kartu ringkasan dan minimal 2 grafik dari data contoh.

* ☐ Halaman selain Katalog dan Detail Kursus memakai *noindex*; *sitemap* hanya berisi kursus terbit.

* ☐ Minimal 15 test case dari aturan bisnis dijalankan dan hasilnya dicatat.

## **14\. Di Luar Lingkup**

Kelas langsung (*live class*) dan jadwal pertemuan, forum diskusi, tugas unggah file dan penilaian manual, soal selain pilihan ganda, bank soal acak, kupon diskon, *refund* otomatis, verifikasi sertifikat publik, sertifikat dengan desain khusus per kursus, aplikasi ponsel *native*, dan banyak bahasa.