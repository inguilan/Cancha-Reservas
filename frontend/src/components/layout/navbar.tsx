"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isAuthPage = ["/login", "/register"].includes(pathname);

  if (isAuthPage) return null;

  const navItems = [
    { href: "/", label: "Canchas" },
    { href: "/mis-reservas", label: "Mis reservas" },
    ...(user?.role === "ADMIN" ? [{ href: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-brand-700">
          Cancha Pro
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition ${pathname === item.href ? "text-brand-700" : "text-slate-600 hover:text-brand-600"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">
                  {user.role === "ADMIN" ? "Encargado" : "Usuario"}
                </span>
                <span className="text-sm text-slate-600">{user.username}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
