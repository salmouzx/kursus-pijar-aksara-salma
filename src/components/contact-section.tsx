"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle, ArrowUpRight } from "lucide-react";

export function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [kategori, setKategori] = useState("Course Reguler");
  const [pesan, setPesan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !kontak || !pesan) {
      alert("Harap lengkapi semua kolom isian.");
      return;
    }
    setFormSubmitted(true);
  };

  return (
    <section id="kontak" className="w-full py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1F382B] tracking-tight leading-tight">
            Hubungi Tim Pijar Aksara
          </h2>
          <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
            Ingin berkonsultasi mengenai pemilihan course, pendaftaran kolektif kantor, atau kebutuhan in-house training? Kami siap membantu.
          </p>
        </div>

        {/* 2 Columns: Contact Info & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Direct Contact Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">

            {/* Campus Address Card */}
            <div className="p-6 rounded-[28px] glass-card border border-white/80 shadow-md">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1F382B] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#EBF3EF]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1F382B]">Lokasi Kampus Pelatihan</h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Jl. Margonda Raya No. 120, Kemiri Muka, Beji, Kota Depok, Jawa Barat 16423
                  </p>
                  <a
                    href="https://maps.google.com/?q=Margonda+Raya+Depok"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#58816D] hover:text-[#1F382B] mt-2"
                  >
                    <span>Petunjuk Arah Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp Hotline Card */}
            <div className="p-6 rounded-[28px] glass-card border border-emerald-300/60 shadow-md">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#58816D] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1F382B]">WhatsApp Hotline & CS</h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    Respon cepat pada jam operasional kerja.
                  </p>
                  <a
                    href="https://wa.me/6281290008800"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#58816D] hover:bg-[#456655] text-white text-xs font-bold mt-3 transition-colors shadow-xs"
                  >
                    <span>Chat WhatsApp: 0812-9000-8800</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Email & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl glass-card border border-white/80 shadow-xs">
                <Mail className="w-4 h-4 text-zinc-500 mb-2" />
                <h4 className="text-xs font-bold text-[#1F382B]">Email Resmi</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">halo@pijaraksara.id</p>
              </div>

              <div className="p-5 rounded-2xl glass-card border border-white/80 shadow-xs">
                <Clock className="w-4 h-4 text-zinc-500 mb-2" />
                <h4 className="text-xs font-bold text-[#1F382B]">Jam Kerja</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Senin - Sabtu: 08.30 - 17.00 WIB</p>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 glass-panel rounded-[32px] p-6 sm:p-8 border border-white/80 shadow-xl">
            {formSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[#1F382B]">Pesan Anda Telah Diterima!</h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong>{nama}</strong>. Tim konsultan pelatihan Pijar Aksara akan segera menghubungi Anda melalui kontak <strong>{kontak}</strong>.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setNama("");
                    setKontak("");
                    setPesan("");
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#58816D] text-white hover:bg-[#456655] transition-colors cursor-pointer"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-[#1F382B]">Kirim Formulir Konsultasi</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Silakan tinggalkan pesan, kami akan merespons dalam waktu 1x24 jam kerja.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama Anda atau Instansi"
                      className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#58816D] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Nomor WhatsApp / Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={kontak}
                      onChange={(e) => setKontak(e.target.value)}
                      placeholder="08xxxxxxxxxx atau email@kantor.com"
                      className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#58816D] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Kategori Kebutuhan
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#58816D] focus:bg-white transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Course Reguler">Pendaftaran Course Reguler (Excel / Canva / English / Pembukuan)</option>
                    <option value="In-House Training">Pelatihan In-House Training Kantor / B2B</option>
                    <option value="Pendampingan UMKM">Pendampingan Keuangan &amp; Branding UMKM</option>
                    <option value="Uji Kompetensi">Uji Kompetensi &amp; Sertifikasi Mandiri</option>
                    <option value="Lainnya">Pertanyaan Umum Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Pesan atau Pertanyaan *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    placeholder="Tuliskan jumlah peserta, topik yang diminati, atau pertanyaan spesifik Anda..."
                    className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#58816D] focus:bg-white transition-all shadow-2xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-xs font-bold bg-[#58816D] hover:bg-[#456655] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Kirim Pesan Konsultasi</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
