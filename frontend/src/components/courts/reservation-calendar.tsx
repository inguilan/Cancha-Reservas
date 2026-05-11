"use client";

import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";

import { Reservation } from "@/types";

interface ReservationCalendarProps {
  reservations: Reservation[];
}

const HOURS = Array.from({ length: 15 }, (_, index) => `${String(index + 8).padStart(2, "0")}:00`);

const STATUS_STYLE: Record<Reservation["status"], string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELED: "border-slate-200 bg-slate-50 text-slate-400",
  FINISHED: "border-brand-200 bg-brand-50 text-brand-700",
};

const STATUS_LABEL: Record<Reservation["status"], string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
  FINISHED: "Finalizada",
};

export function ReservationCalendar({ reservations }: ReservationCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [courtFilter, setCourtFilter] = useState("ALL");

  const weekStart = useMemo(() => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7), [weekOffset]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  const courtOptions = useMemo(
    () => Array.from(new Set(reservations.map((reservation) => reservation.court_name))).sort(),
    [reservations],
  );

  const visibleReservations = useMemo(() => {
    return reservations.filter((reservation) => courtFilter === "ALL" || reservation.court_name === courtFilter);
  }, [courtFilter, reservations]);

  const reservationMap = useMemo(() => {
    const map = new Map<string, Reservation>();
    visibleReservations
      .filter((reservation) => reservation.status !== "CANCELED")
      .forEach((reservation) => {
        map.set(`${reservation.date}-${reservation.start_time.slice(0, 5)}`, reservation);
      });
    return map;
  }, [visibleReservations]);

  const weekReservations = useMemo(() => {
    const validDates = new Set(days.map((day) => format(day, "yyyy-MM-dd")));
    return visibleReservations.filter((reservation) => validDates.has(reservation.date) && reservation.status !== "CANCELED");
  }, [days, visibleReservations]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-brand-800">Calendario semanal</h2>
          <p className="mt-1 text-sm text-slate-500">Vista organizada por semana, con filtro por cancha y estados reales de cada bloque.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[auto_1fr] lg:min-w-[420px]">
          <div className="flex overflow-hidden rounded-2xl border border-brand-100 bg-white">
            <button onClick={() => setWeekOffset((current) => current - 1)} className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              ←
            </button>
            <div className="flex items-center border-x border-brand-100 px-4 text-sm font-semibold text-brand-800">
              {format(days[0], "dd MMM", { locale: es })} - {format(days[6], "dd MMM", { locale: es })}
            </div>
            <button onClick={() => setWeekOffset((current) => current + 1)} className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              →
            </button>
          </div>
          <select
            value={courtFilter}
            onChange={(event) => setCourtFilter(event.target.value)}
            className="rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-brand-400"
          >
            <option value="ALL">Todas las canchas</option>
            {courtOptions.map((courtName) => (
              <option key={courtName} value={courtName}>
                {courtName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Confirmadas</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-800">
            {weekReservations.filter((reservation) => reservation.status === "CONFIRMED").length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Pendientes</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-800">
            {weekReservations.filter((reservation) => reservation.status === "PENDING").length}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Finalizadas</p>
          <p className="mt-2 text-2xl font-extrabold text-brand-800">
            {weekReservations.filter((reservation) => reservation.status === "FINISHED").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Filtro actual</p>
          <p className="mt-2 text-sm font-extrabold text-slate-700">{courtFilter === "ALL" ? "Todas las canchas" : courtFilter}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Confirmada</span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">Pendiente</span>
        <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-brand-700">Finalizada</span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">Libre</span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[1080px] grid-cols-8 gap-2">
          <div className="rounded-2xl bg-brand-50 px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-brand-700">Hora</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="rounded-2xl bg-brand-50 px-3 py-3 text-xs font-extrabold uppercase tracking-wide text-brand-700">
              <p>{format(day, "EEE", { locale: es })}</p>
              <p className="mt-1 text-sm text-brand-900">{format(day, "dd/MM", { locale: es })}</p>
            </div>
          ))}

          {HOURS.map((hour) => (
            <div key={`row-${hour}`} className="contents">
              <div className="rounded-2xl border border-brand-100 bg-white px-3 py-4 text-sm font-bold text-slate-700">{hour}</div>
              {days.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const reservation = reservationMap.get(`${dayStr}-${hour}`);

                if (!reservation) {
                  return (
                    <div key={`${dayStr}-${hour}`} className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center text-xs font-semibold text-slate-400">
                      Libre
                    </div>
                  );
                }

                return (
                  <div key={`${dayStr}-${hour}`} className={`rounded-2xl border px-3 py-3 text-xs ${STATUS_STYLE[reservation.status]}`}>
                    <p className="font-extrabold">{STATUS_LABEL[reservation.status]}</p>
                    <p className="mt-1 truncate font-semibold">{reservation.court_name}</p>
                    <p className="mt-1 truncate">{reservation.user_name}</p>
                    <p className="mt-1">{reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
