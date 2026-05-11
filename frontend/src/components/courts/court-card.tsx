"use client";

import { useState } from "react";

import { Court } from "@/types";

import { ReserveModal } from "./reserve-modal";

interface CourtCardProps {
  court: Court;
  onReserved: () => void;
}

const STATUS_CONFIG: Record<Court["status"], { label: string; color: string; dot: string }> = {
  AVAILABLE: { label: "Disponible", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  MAINTENANCE: { label: "Mantenimiento", color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  OCCUPIED: { label: "Ocupada", color: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
};

const SPORT_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  FOOTBALL: { emoji: "⚽", gradient: "from-emerald-500 to-emerald-700" },
  BASKETBALL: { emoji: "🏀", gradient: "from-orange-500 to-orange-700" },
  TENNIS: { emoji: "🎾", gradient: "from-yellow-500 to-yellow-700" },
  PADEL: { emoji: "🏓", gradient: "from-sky-500 to-sky-700" },
  VOLLEYBALL: { emoji: "🏐", gradient: "from-purple-500 to-purple-700" },
  OTHER: { emoji: "🏟️", gradient: "from-slate-500 to-slate-700" },
};

const SPORT_LABELS: Record<string, string> = {
  FOOTBALL: "Fútbol",
  BASKETBALL: "Baloncesto",
  TENNIS: "Tenis",
  PADEL: "Pádel",
  VOLLEYBALL: "Vóley",
  OTHER: "Otra",
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CourtCard({ court, onReserved }: CourtCardProps) {
  const [showModal, setShowModal] = useState(false);

  const sport = SPORT_CONFIG[court.court_type] ?? SPORT_CONFIG.OTHER;
  const status = STATUS_CONFIG[court.status];
  const weekdays: number[] = Array.isArray(court.available_weekdays) ? court.available_weekdays : [];

  return (
    <>
      <article className="panel overflow-hidden fade-up flex flex-col hover:shadow-lg transition-shadow">
        {/* Header con gradiente por deporte */}
        <div className={`relative h-36 w-full bg-gradient-to-br ${sport.gradient} p-4 text-white`}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                {SPORT_LABELS[court.court_type] ?? court.court_type}
              </span>
              <h3 className="mt-3 text-xl font-extrabold leading-tight drop-shadow">{court.name}</h3>
              <p className="mt-0.5 text-sm opacity-80">📍 {court.location}</p>
            </div>
            <span className="text-4xl drop-shadow">{sport.emoji}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="text-sm font-bold text-brand-700">
              ${court.price_per_hour}
              <span className="text-xs font-normal text-slate-500"> /h</span>
            </span>
          </div>

          {/* Horario */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>🕐</span>
            <span>{court.opening_time} – {court.closing_time}</span>
          </div>

          {/* Días disponibles */}
          {weekdays.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((day, i) => (
                <span
                  key={i}
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                    weekdays.includes(i)
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          )}

          <button
            disabled={court.status !== "AVAILABLE"}
            onClick={() => setShowModal(true)}
            className="mt-auto w-full rounded-xl bg-brand-600 px-3 py-2.5 font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            {court.status === "AVAILABLE" ? "Reservar ahora" : status.label}
          </button>
        </div>
      </article>

      {showModal && (
        <ReserveModal
          court={court}
          onClose={() => setShowModal(false)}
          onSuccess={() => { onReserved(); setShowModal(false); }}
        />
      )}
    </>
  );
}
