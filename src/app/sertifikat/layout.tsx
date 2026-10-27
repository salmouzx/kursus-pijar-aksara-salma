import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sertifikat Kelulusan | Pijar Aksara",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SertifikatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
