"use client";

import { useEffect, useState } from "react";

import { courtService, reservationService } from "@/lib/services";
import { Court } from "@/types";

interface Slot {
  start_time: string;
  end_time: string;
  available: boolean;
}

interface ReserveModalProps {
  court: Court;
  onClose: () => void;
  onSuccess: () => void;
}

const SPORT_EMOJI: Record<string, string> = {
  FOOTBALL: "⚽",
  BASKETBALL: "🏀",
  TENNIS: "🎾",
  PADEL: "🏓",
  VOLLEYBALL: "🏐",
  OTHER: "🏟️",
};

export function ReserveModal({ court, onClose, onSuccess }: ReserveModalProps) {
  // Step 1 = elegir fecha, Step 2 = elegir slots, Step 3 = confirmar
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // start_times seleccionados
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fecha mínima = hoy
  const today = new Date().toISOString().split("T")[0];

  const loadSlots = async (selectedDate: string) => {
    setLoadingSlots(true);
    setSelectedSlots([]);
    setError("");
    try {
      const data = await courtService.availableSlots(court.id, selectedDate);
      setSlots(data.slots);
    } catch {
      setError("No se pudieron cargar los horarios");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateNext = () => {
    if (!date) return;
    loadSlots(date);
    setStep(2);
  };

  const toggleSlot = (startTime: string) => {
    setSelectedSlots((prev) =>
      prev.includes(startTime) ? prev.filter((s) => s !== startTime) : [...prev, startTime],
    );
  };

  // Calcular precio total: 1 slot = 1 hora = price_per_hour
  const totalPrice = (selectedSlots.length * parseFloat(court.price_per_hour)).toFixed(2);

  // Calcular start_time y end_time del bloque completo (slots consecutivos)
  const getTimeRange = () => {
    if (selectedSlots.length === 0) return { start_time: "", end_time: "" };
    const sorted = [...selectedSlots].sort();
    const first = sorted[0];
    // end_time es el slot siguiente al último seleccionado
    const lastSlot = slots.find((s) => s.start_time === sorted[sorted.length - 1]);
    const end_time = lastSlot?.end_time ?? "";
    return { start_time: first, end_time };
  };

  const handleConfirm = async () => {
    setError("");
    if (selectedSlots.length === 0) {
      setError("Selecciona al menos un horario");
      return;
    }
    const { start_time, end_time } = getTimeRange();
    setSaving(true);
    try {
      await reservationService.create({
        court: court.id,
        date,
        start_time,
        end_time,
        notes,
        status: "PENDING",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        Object.values(err?.response?.data ?? {})[0] ||
        "No se pudo crear la reserva";
      setError(Array.isArray(msg) ? msg[0] : String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl fade-up overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {SPORT_EMOJI[court.court_type] ?? "🏟️"} {court.court_type}
              </p>
              <h3 className="mt-1 text-xl font-extrabold">{court.name}</h3>
              <p className="text-sm opacity-75">{court.location}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Step indicator */}
          <div className="mt-4 flex gap-2">
            {[
              { n: 1, label: "Fecha" },
              { n: 2, label: "Horario" },
              { n: 3, label: "Confirmar" },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-1">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step >= n ? "bg-white text-brand-700" : "bg-white/30 text-white"
                  }`}
                >
                  {n}
                </div>
                <span className={`text-xs ${step >= n ? "text-white" : "text-white/60"}`}>{label}</span>
                {n < 3 && <span className="mx-1 text-white/40">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">

          {/* ---- STEP 1: Fecha ---- */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Selecciona la fecha</label>
                <input
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                <p>
                  <span className="font-semibold">Horario de apertura:</span> {court.opening_time} – {court.closing_time}
                </p>
                <p>
                  <span className="font-semibold">Precio:</span> ${court.price_per_hour} / hora
                </p>
              </div>
              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
              <div className="flex justify-end">
                <button
                  disabled={!date}
                  onClick={handleDateNext}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Ver horarios →
                </button>
              </div>
            </div>
          )}

          {/* ---- STEP 2: Selección de slots ---- */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="text-brand-600 text-sm hover:underline">← Cambiar fecha</button>
                <span className="text-sm text-slate-500">|</span>
                <p className="text-sm font-semibold text-slate-700">
                  {new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-6">No hay bloques configurados para esta cancha.</p>
              ) : (
                <>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-brand-500 inline-block" /> Seleccionado</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Disponible</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-200 inline-block" /> Ocupado</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const selected = selectedSlots.includes(slot.start_time);
                      return (
                        <button
                          key={slot.start_time}
                          disabled={!slot.available}
                          onClick={() => toggleSlot(slot.start_time)}
                          className={`rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all ${
                            !slot.available
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through"
                              : selected
                                ? "border-brand-500 bg-brand-500 text-white shadow-md scale-105"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-brand-400 hover:bg-brand-50"
                          }`}
                        >
                          <span className="block text-center">{slot.start_time}</span>
                          <span className="block text-center opacity-70">– {slot.end_time}</span>
                          {!slot.available && <span className="block text-center text-[10px]">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {selectedSlots.length > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm">
                  <p className="font-semibold text-emerald-800">
                    {selectedSlots.length} hora{selectedSlots.length > 1 ? "s" : ""} seleccionada{selectedSlots.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-emerald-700">Total estimado: <strong>${totalPrice}</strong></p>
                </div>
              )}

              {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

              <div className="flex justify-end">
                <button
                  disabled={selectedSlots.length === 0 || loadingSlots}
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ---- STEP 3: Confirmar ---- */}
          {step === 3 && (() => {
            const { start_time, end_time } = getTimeRange();
            return (
              <div className="space-y-4">
                <button onClick={() => setStep(2)} className="text-brand-600 text-sm hover:underline">← Cambiar horario</button>

                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 space-y-2 text-sm">
                  <h4 className="font-bold text-brand-800 text-base">Resumen de reserva</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700">
                    <span className="font-semibold">Cancha:</span><span>{court.name}</span>
                    <span className="font-semibold">Fecha:</span>
                    <span>
                      {new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
                        weekday: "short", day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    <span className="font-semibold">Inicio:</span><span>{start_time}</span>
                    <span className="font-semibold">Fin:</span><span>{end_time}</span>
                    <span className="font-semibold">Duración:</span><span>{selectedSlots.length} hora{selectedSlots.length > 1 ? "s" : ""}</span>
                    <span className="font-bold text-brand-700">Total:</span>
                    <span className="font-bold text-brand-700 text-base">${totalPrice}</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Notas adicionales (opcional)</label>
                  <textarea
                    placeholder="Ej: Traer balón, somos 5 personas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                  />
                </div>

                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

                <button
                  disabled={saving}
                  onClick={handleConfirm}
                  className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Reservando..." : "✅ Confirmar reserva"}
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
