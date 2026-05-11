"use client";

import { FormEvent, useEffect, useState } from "react";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ProtectedRoute } from "@/components/ui/protected-route";
import { courtService } from "@/lib/services";
import { Court } from "@/types";

const initialForm = {
  name: "",
  court_type: "FOOTBALL",
  price_per_hour: "",
  location: "",
  status: "AVAILABLE",
  opening_time: "08:00",
  closing_time: "22:00",
  available_weekdays: [1, 2, 3, 4, 5, 6, 0],
};

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    const data = await courtService.list();
    setCourts(data.results);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleWeekday = (day: number) => {
    setForm((current) => ({
      ...current,
      available_weekdays: current.available_weekdays.includes(day)
        ? current.available_weekdays.filter((value) => value !== day)
        : [...current.available_weekdays, day].sort(),
    }));
  };

  const createCourt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const normalizedPrice = form.price_per_hour.replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");

    if (Number.isNaN(Number(normalizedPrice)) || Number(normalizedPrice) <= 0) {
      setError("El precio debe ser un numero valido mayor que cero. Usa por ejemplo 90000 o 90000.00");
      setSaving(false);
      return;
    }

    if (form.available_weekdays.length === 0) {
      setError("Selecciona al menos un dia disponible para la cancha");
      setSaving(false);
      return;
    }

    try {
      await courtService.create({
        ...form,
        price_per_hour: Number(normalizedPrice).toFixed(2),
      } as Partial<Court>);
      setForm(initialForm);
      await loadData();
    } catch (submitError: any) {
      const responseData = submitError?.response?.data;
      const firstError =
        responseData?.non_field_errors?.[0] ||
        responseData?.price_per_hour?.[0] ||
        responseData?.name?.[0] ||
        responseData?.location?.[0] ||
        responseData?.opening_time?.[0] ||
        responseData?.closing_time?.[0] ||
        responseData?.available_weekdays?.[0] ||
        responseData?.detail;
      setError(typeof firstError === "string" ? firstError : "No se pudo crear la cancha");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourt = async (id: number) => {
    await courtService.remove(id);
    await loadData();
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <section className="space-y-4">
          <form onSubmit={createCourt} className="panel grid gap-3 p-4 md:grid-cols-2">
            <h1 className="md:col-span-2 text-2xl font-extrabold text-brand-800">Gestion de canchas</h1>
            <input className="rounded-xl border border-brand-200 px-3 py-2" placeholder="Nombre" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            <input className="rounded-xl border border-brand-200 px-3 py-2" placeholder="Ubicacion" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} required />
            <input className="rounded-xl border border-brand-200 px-3 py-2" placeholder="Precio por hora" value={form.price_per_hour} onChange={(e) => setForm((s) => ({ ...s, price_per_hour: e.target.value }))} required />
            <select className="rounded-xl border border-brand-200 px-3 py-2" value={form.court_type} onChange={(e) => setForm((s) => ({ ...s, court_type: e.target.value }))}>
              <option value="FOOTBALL">Futbol</option>
              <option value="BASKETBALL">Baloncesto</option>
              <option value="TENNIS">Tenis</option>
              <option value="PADEL">Padel</option>
              <option value="VOLLEYBALL">Voleibol</option>
              <option value="OTHER">Otra</option>
            </select>
            <select className="rounded-xl border border-brand-200 px-3 py-2" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="AVAILABLE">Disponible</option>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="OCCUPIED">Ocupada</option>
            </select>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Hora de apertura</label>
              <input type="time" className="w-full rounded-xl border border-brand-200 px-3 py-2" value={form.opening_time} onChange={(e) => setForm((s) => ({ ...s, opening_time: e.target.value }))} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Hora de cierre</label>
              <input type="time" className="w-full rounded-xl border border-brand-200 px-3 py-2" value={form.closing_time} onChange={(e) => setForm((s) => ({ ...s, closing_time: e.target.value }))} required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-600">Dias disponibles</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 1, label: "Lun" },
                  { value: 2, label: "Mar" },
                  { value: 3, label: "Mie" },
                  { value: 4, label: "Jue" },
                  { value: 5, label: "Vie" },
                  { value: 6, label: "Sab" },
                  { value: 0, label: "Dom" },
                ].map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                      form.available_weekdays.includes(day.value)
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">Para precios, usa 90000 o 90000.00. Si escribes 90.000 el backend lo toma como decimal invalido.</p>
            </div>
            {error ? <p className="md:col-span-2 text-sm font-semibold text-red-600">{error}</p> : null}
            <button disabled={saving} className="md:col-span-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Creando..." : "Crear cancha"}</button>
          </form>

          <div className="panel p-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-slate-500">
                    <th className="py-2">Nombre</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {courts.map((court) => (
                    <tr key={court.id} className="border-b border-brand-50">
                      <td className="py-3 font-semibold">{court.name}</td>
                      <td>{court.court_type}</td>
                      <td>{court.status}</td>
                      <td>${court.price_per_hour}</td>
                      <td>
                        <button className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white" onClick={() => deleteCourt(court.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
