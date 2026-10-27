"use client";

import { use } from "react";
import DashboardPesertaPage from "@/app/dashboard/page";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default function DynamicAdminPage({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug?.[0] || "dashboard";

  const menuMap: Record<string, "analitik" | "pendaftaran" | "kursus" | "pembayaran" | "sertifikat" | "pengguna" | "audit_log"> = {
    analitik: "analitik",
    dashboard: "analitik",
    pendaftaran: "pendaftaran",
    kursus: "kursus",
    pembayaran: "pembayaran",
    sertifikat: "sertifikat",
    pengguna: "pengguna",
    "audit-log": "audit_log",
    audit_log: "audit_log",
    panel: "analitik",
  };

  const initialMenu = menuMap[slug] || "analitik";
  return <DashboardPesertaPage initialMenu={initialMenu} requiredRole="admin" />;
}
