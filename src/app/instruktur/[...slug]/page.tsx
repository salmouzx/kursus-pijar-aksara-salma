"use client";

import { use } from "react";
import DashboardPesertaPage from "@/app/dashboard/page";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default function DynamicInstrukturPage({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug?.[0] || "dashboard";

  const menuMap: Record<string, "kelola_kursus" | "peserta_nilai"> = {
    kursus: "kelola_kursus",
    "kelola-kursus": "kelola_kursus",
    kelola_kursus: "kelola_kursus",
    peserta: "peserta_nilai",
    "peserta-nilai": "peserta_nilai",
    peserta_nilai: "peserta_nilai",
    dashboard: "kelola_kursus",
  };

  const initialMenu = menuMap[slug] || "kelola_kursus";
  return <DashboardPesertaPage initialMenu={initialMenu} requiredRole="instruktur" />;
}
