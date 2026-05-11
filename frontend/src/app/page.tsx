"use client";

import { useEffect, useState } from "react";

import { CourtCard } from "@/components/courts/court-card";
import { ReservationCalendar } from "@/components/courts/reservation-calendar";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { courtService, reservationService } from "@/lib/services";
import { Court, Reservation } from "@/types";

export default function HomePage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [courtData, reservationData] = await Promise.allSettled([courtService.list(), reservationService.list()]);

      if (courtData.status === "fulfilled") {
        setCourts(courtData.value.results);
      }

      if (reservationData.status === "fulfilled") {
        setReservations(reservationData.value.results);
      } else {
        setReservations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sportTypes = Array.from(new Set(courts.map((court) => court.court_type)));
  const availableCourts = courts.filter((court) => court.status === "AVAILABLE").length;
  const activeReservations = reservations.filter((reservation) => reservation.status !== "CANCELED").length;
  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(search.toLowerCase()) ||
      court.location.toLowerCase().includes(search.toLowerCase());
    const matchesSport = sportFilter === "ALL" || court.court_type === sportFilter;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
              Reservas deportivas en tiempo real
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-brand-900 md:text-5xl">
              Reserva tu cancha con una interfaz clara, rapida y profesional
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 md:text-lg">
              Consulta disponibilidad, elige horario por bloques y administra tus reservas sin cruces ni confusiones.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-brand-100 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Canchas</p>
                <p className="text-2xl font-extrabold text-brand-800">{courts.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Disponibles</p>
                <p className="text-2xl font-extrabold text-emerald-700">{availableCourts}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white/85 px-4 py-3 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reservas activas</p>
                <p className="text-2xl font-extrabold text-amber-700">{activeReservations}</p>
              </div>
            </div>
          </div>

          <div className="grid-bg rounded-3xl border border-brand-100 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h2 className="text-lg font-extrabold text-brand-800">Como reservar</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex gap-3 rounded-2xl bg-brand-50 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-bold text-white">1</span>
                <p>Filtra la cancha por deporte o ubicacion.</p>
              </div>
              <div className="flex gap-3 rounded-2xl bg-emerald-50 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">2</span>
                <p>Selecciona la fecha y toca los bloques horarios libres.</p>
              </div>
              <div className="flex gap-3 rounded-2xl bg-amber-50 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-bold text-white">3</span>
                <p>Confirma el resumen y luego gestiona todo desde Mis reservas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-800">Explora canchas</h2>
            <p className="mt-1 text-sm text-slate-500">Busca por nombre o sede y filtra por deporte.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cancha o ubicacion"
              className="rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-brand-400"
            />
            <select
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}
              className="rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400"
            >
              <option value="ALL">Todos los deportes</option>
              {sportTypes.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourts.length === 0 ? (
        <section className="panel p-10 text-center">
          <p className="text-4xl">🏟️</p>
          <h3 className="mt-3 text-xl font-extrabold text-brand-800">No hay canchas para ese filtro</h3>
          <p className="mt-1 text-sm text-slate-500">Prueba con otra palabra o cambia el deporte seleccionado.</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourts.map((court) => (
            <CourtCard key={court.id} court={court} onReserved={loadData} />
          ))}
        </div>
      )}

      <section className="panel overflow-hidden">
        <div className="border-b border-brand-100 px-5 py-4">
          <h2 className="text-2xl font-extrabold text-brand-800">Calendario semanal</h2>
          <p className="mt-1 text-sm text-slate-500">Vista general de bloques libres y ocupados para planificar mejor.</p>
        </div>
        <div className="p-4">
          <ReservationCalendar reservations={reservations} />
        </div>
      </section>
    </div>
  );
}
