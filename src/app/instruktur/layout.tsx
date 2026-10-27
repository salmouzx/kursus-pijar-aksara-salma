import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Instruktur | Pijar Aksara",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InstrukturLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
