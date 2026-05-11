"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { dashboardService } from "@/lib/services";
import { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardService.stats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Reservas</p>
              <h2 className="mt-2 text-3xl font-extrabold text-brand-700">{stats?.total_reservations ?? 0}</h2>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Ingresos</p>
              <h2 className="mt-2 text-3xl font-extrabold text-brand-700">${stats?.confirmed_income ?? 0}</h2>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Usuarios</p>
              <h2 className="mt-2 text-3xl font-extrabold text-brand-700">{stats?.registered_users ?? 0}</h2>
            </div>
          </div>

          <div className="panel h-[320px] p-4">
            <h3 className="mb-3 text-lg font-bold text-brand-800">Canchas mas usadas</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.top_courts ?? []}>
                <XAxis dataKey="court__name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2b67f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
