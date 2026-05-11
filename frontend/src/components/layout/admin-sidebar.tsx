"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/admin/canchas", label: "Gestion de canchas" },
  { href: "/admin/reservas", label: "Gestion de reservas" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="panel hidden h-fit min-w-60 p-4 lg:block">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Admin</h3>
      <ul className="space-y-1">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-xl px-3 py-2 text-sm font-semibold ${pathname === item.href ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-brand-50"}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
