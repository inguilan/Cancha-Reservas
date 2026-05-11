import type { Metadata } from "next";

import { AuthInitializer } from "@/components/layout/auth-initializer";
import { Navbar } from "@/components/layout/navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cancha Pro",
  description: "Plataforma full stack de reservas deportivas",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AuthInitializer>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-7xl px-4 py-6 md:px-8">{children}</main>
        </AuthInitializer>
      </body>
    </html>
  );
}
