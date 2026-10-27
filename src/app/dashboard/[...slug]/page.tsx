"use client";

import { use } from "react";
import DashboardPesertaPage from "@/app/dashboard/page";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default function DynamicPesertaDashboardPage({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug?.[0] || "dashboard";

  const menuMap: Record<string, "dashboard" | "kursus" | "tagihan" | "sertifikat"> = {
    dashboard: "dashboard",
    kursus: "kursus",
    tagihan: "tagihan",
    sertifikat: "sertifikat",
  };

  const initialMenu = menuMap[slug] || "dashboard";
  return <DashboardPesertaPage initialMenu={initialMenu} />;
}
