"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { reservationService } from "@/lib/services";
import { Reservation } from "@/types";

const STATUS_CONFIG: Record<Reservation["status"], { label: string; badge: string; hint: string }> = {
  PENDING: {
    label: "Pendiente",
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    hint: "Aun no confirmada por el encargado",
  },
  CONFIRMED: {
    label: "Confirmada",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    hint: "Reserva aprobada y lista para usarse",
  },
  CANCELED: {
    label: "Cancelada",
    badge: "bg-red-100 text-red-700 border border-red-200",
    hint: "Reserva anulada",
  },
  FINISHED: {
    label: "Finalizada",
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
    hint: "Reserva completada",
  },
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"ALL" | Reservation["status"]>("ALL");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await reservationService.list();
      setReservations(data.results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReservations = useMemo(() => {
    if (filter === "ALL") return reservations;
    return reservations.filter((reservation) => reservation.status === filter);
  }, [filter, reservations]);

  const statusCounts = useMemo(
    () => ({
      PENDING: reservations.filter((reservation) => reservation.status === "PENDING").length,
      CONFIRMED: reservations.filter((reservation) => reservation.status === "CONFIRMED").length,
      CANCELED: reservations.filter((reservation) => reservation.status === "CANCELED").length,
      FINISHED: reservations.filter((reservation) => reservation.status === "FINISHED").length,
    }),
    [reservations],
  );

  const runAction = async (id: number, action: "confirm" | "finish" | "cancel") => {
    setUpdatingId(id);
    setError("");
    try {
      if (action === "confirm") {
        await reservationService.confirm(id);
      } else if (action === "finish") {
        await reservationService.finish(id);
      } else {
        await reservationService.cancel(id);
      }
      await loadData();
    } catch (submitError: any) {
      const message = submitError?.response?.data?.detail || "No se pudo actualizar la reserva";
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <section className="space-y-4">
          <div className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-brand-800">Gestion de reservas</h1>
                <p className="mt-1 text-sm text-slate-500">Aqui el encargado deja claro si una reserva quedo pendiente, confirmada, cancelada o finalizada.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button onClick={() => setFilter("ALL")} className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold ${filter === "ALL" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                  Todas
                  <span className="block text-xs opacity-80">{reservations.length}</span>
                </button>
                <button onClick={() => setFilter("PENDING")} className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold ${filter === "PENDING" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-800"}`}>
                  Pendientes
                  <span className="block text-xs opacity-80">{statusCounts.PENDING}</span>
                </button>
                <button onClick={() => setFilter("CONFIRMED")} className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold ${filter === "CONFIRMED" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800"}`}>
                  Confirmadas
                  <span className="block text-xs opacity-80">{statusCounts.CONFIRMED}</span>
                </button>
                <button onClick={() => setFilter("FINISHED")} className={`rounded-2xl px-3 py-2 text-left text-sm font-semibold ${filter === "FINISHED" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                  Finalizadas
                  <span className="block text-xs opacity-80">{statusCounts.FINISHED}</span>
                </button>
              </div>
            </div>
            {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="panel h-48 animate-pulse bg-slate-100" />
              ))}
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="panel p-10 text-center">
              <p className="text-4xl">📋</p>
              <h2 className="mt-3 text-xl font-extrabold text-brand-800">No hay reservas en este estado</h2>
              <p className="mt-1 text-sm text-slate-500">Cambia el filtro o espera nuevas solicitudes.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredReservations.map((reservation) => {
                const status = STATUS_CONFIG[reservation.status];
                return (
                  <article key={reservation.id} className="panel overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-brand-500 to-brand-700" />
                    <div className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-extrabold text-brand-800">{reservation.court_name}</h2>
                          <p className="mt-1 text-sm text-slate-500">Solicitada por {reservation.user_name}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${status.badge}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <p className="text-xs font-bold uppercase text-slate-500">Fecha</p>
                          <p className="mt-1 font-semibold">{reservation.date}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <p className="text-xs font-bold uppercase text-slate-500">Horario</p>
                          <p className="mt-1 font-semibold">{reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <p className="text-xs font-bold uppercase text-slate-500">Total</p>
                          <p className="mt-1 font-semibold text-brand-700">${reservation.total_price}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <p className="text-xs font-bold uppercase text-slate-500">Lectura del estado</p>
                          <p className="mt-1 font-semibold">{status.hint}</p>
                        </div>
                      </div>

                      {reservation.notes ? (
                        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3 text-sm text-slate-700">
                          <p className="text-xs font-bold uppercase text-brand-700">Notas</p>
                          <p className="mt-1">{reservation.notes}</p>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        {reservation.status === "PENDING" ? (
                          <button
                            onClick={() => runAction(reservation.id, "confirm")}
                            disabled={updatingId === reservation.id}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === reservation.id ? "Actualizando..." : "Confirmar reserva"}
                          </button>
                        ) : null}
                        {reservation.status === "CONFIRMED" ? (
                          <button
                            onClick={() => runAction(reservation.id, "finish")}
                            disabled={updatingId === reservation.id}
                            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingId === reservation.id ? "Actualizando..." : "Marcar como finalizada"}
                          </button>
                        ) : null}
                        {reservation.status !== "CANCELED" && reservation.status !== "FINISHED" ? (
                          <button
                            onClick={() => runAction(reservation.id, "cancel")}
                            disabled={updatingId === reservation.id}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancelar reserva
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
