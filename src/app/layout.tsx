import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TidyHubb - Profesionales de confianza para tu hogar",
  description:
    "TidyHubb es tu plataforma de confianza para reservar profesionales calificados y verificados para el mantenimiento y aseo de tu hogar, bajo demanda.",
  keywords: [
    "servicios del hogar",
    "limpieza profesional",
    "jardinería",
    "plomería",
    "electricidad",
    "mantenimiento del hogar",
    "profesionales verificados",
  ],
  openGraph: {
    title: "TidyHubb - Profesionales de confianza para tu hogar",
    description:
      "Reserva profesionales calificados y verificados para el cuidado de tu hogar",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
