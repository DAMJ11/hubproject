import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FashionsDen - Diseño y producción de moda",
  description:
    "FashionsDen es tu plataforma para diseño de moda profesional: bocetos, fichas técnicas, patronaje digital, muestras y producción.",
  keywords: [
    "diseño de moda",
    "bocetos de moda",
    "fichas técnicas",
    "patronaje digital",
    "producción textil",
    "muestras de moda",
    "colecciones de moda",
  ],
  openGraph: {
    title: "FashionsDen - Diseño y producción de moda",
    description:
      "Plataforma profesional de diseño, patronaje y producción de moda",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
