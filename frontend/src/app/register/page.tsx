"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authService } from "@/lib/services";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register(form);
      router.push("/login");
    } catch (registerError: any) {
      const data = registerError?.response?.data;
      const firstError =
        data?.errors?.non_field_errors?.[0] ||
        data?.non_field_errors?.[0] ||
        Object.values(data?.errors || data || {}).flat?.()?.[0] ||
        data?.detail;

      setError(typeof firstError === "string" ? firstError : "No se pudo registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-brand-100 bg-white p-8 shadow-soft">
      <h1 className="text-3xl font-extrabold text-brand-800">Crear cuenta</h1>
      <p className="mt-2 text-sm text-slate-500">Crea tu perfil para reservar canchas.</p>

      <form className="mt-6 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        {Object.keys(form).map((field) => (
          <input
            key={field}
            type={field.includes("password") ? "password" : "text"}
            placeholder={field}
            value={form[field as keyof typeof form]}
            onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
            className="w-full rounded-xl border border-brand-200 px-4 py-3"
            required
          />
        ))}
        {error ? <p className="md:col-span-2 text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          disabled={loading}
          className="md:col-span-2 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Ya tienes cuenta? <Link className="font-semibold text-brand-700" href="/login">Inicia sesion</Link>
      </p>
    </section>
  );
}
