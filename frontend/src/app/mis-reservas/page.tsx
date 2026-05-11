"use client";

import { useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/ui/protected-route";
import { reservationService } from "@/lib/services";
import { Reservation } from "@/types";

const STATUS_CONFIG: Record<Reservation["status"], { label: string; bg: string; text: string; icon: string }> = {
  PENDING: { label: "Pendiente", bg: "bg-amber-100", text: "text-amber-800", icon: "⏳" },
  CONFIRMED: { label: "Confirmada", bg: "bg-emerald-100", text: "text-emerald-800", icon: "✅" },
  CANCELED: { label: "Cancelada", bg: "bg-red-100", text: "text-red-700", icon: "❌" },
  FINISHED: { label: "Finalizada", bg: "bg-slate-100", text: "text-slate-600", icon: "🏁" },
};

const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "CANCELED", label: "Canceladas" },
  { value: "FINISHED", label: "Finalizadas" },
];

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.list();
      setReservations(data.results);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: number) => {
    setCancelingId(id);
    try {
      await reservationService.cancel(id);
      await loadReservations();
    } finally {
      setCancelingId(null);
      setConfirmCancel(null);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const filtered = filter === "ALL" ? reservations : reservations.filter((r) => r.status === filter);

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (t: string) => t.slice(0, 5);

  return (
    <ProtectedRoute>
      <div className="space-y-5">
        {/* Header */}
        <div className="panel p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-brand-800">Mis reservas</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                {reservations.length} reserva{reservations.length !== 1 ? "s" : ""} en total
              </p>
            </div>
            {/* Filtros */}
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    filter === opt.value
                      ? "bg-brand-600 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel p-10 text-center">
            <p className="text-4xl">📅</p>
            <p className="mt-3 text-lg font-semibold text-slate-700">
              {filter === "ALL" ? "No tienes reservas aún" : `No hay reservas ${FILTER_OPTIONS.find(o => o.value === filter)?.label.toLowerCase()}`}
            </p>
            <p className="mt-1 text-sm text-slate-500">Ve a la página principal y reserva tu cancha favorita.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const sc = STATUS_CONFIG[r.status];
              const isActive = r.status !== "CANCELED" && r.status !== "FINISHED";
              return (
                <div
                  key={r.id}
                  className={`panel overflow-hidden fade-up flex flex-col transition-shadow hover:shadow-md ${
                    r.status === "CANCELED" ? "opacity-60" : ""
                  }`}
                >
                  {/* Top color strip */}
                  <div className="h-2 w-full bg-gradient-to-r from-brand-500 to-brand-700" />

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    {/* Court name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-brand-800 leading-tight">{r.court_name}</h3>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm text-slate-700">
                      <span className="text-slate-500">📅 Fecha</span>
                      <span className="font-semibold">{formatDate(r.date)}</span>
                      <span className="text-slate-500">🕐 Horario</span>
                      <span className="font-semibold">{formatTime(r.start_time)} – {formatTime(r.end_time)}</span>
                      <span className="text-slate-500">💰 Total</span>
                      <span className="font-bold text-brand-700">${r.total_price}</span>
                    </div>

                    {r.notes && (
                      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 italic">
                        "{r.notes}"
                      </p>
                    )}

                    {/* Action */}
                    <div className="mt-auto pt-1">
                      {isActive ? (
                        confirmCancel === r.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmCancel(null)}
                              className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              No, volver
                            </button>
                            <button
                              disabled={cancelingId === r.id}
                              onClick={() => cancelReservation(r.id)}
                              className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              {cancelingId === r.id ? "Cancelando..." : "Sí, cancelar"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmCancel(r.id)}
                            className="w-full rounded-xl border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancelar reserva
                          </button>
                        )
                      ) : (
                        <p className="text-center text-xs text-slate-400">
                          {r.status === "CANCELED" ? "Reserva cancelada" : "Reserva finalizada"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
