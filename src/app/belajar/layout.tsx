import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ruang Belajar | Pijar Aksara",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BelajarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
