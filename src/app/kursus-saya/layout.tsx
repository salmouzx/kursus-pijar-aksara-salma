import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kursus Saya | Pijar Aksara",
  robots: {
    index: false,
    follow: false,
  },
};

export default function KursusSayaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
