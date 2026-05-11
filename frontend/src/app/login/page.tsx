"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await login(username, password);
      router.push("/");
    } catch {
      setError("Credenciales invalidas");
    }
  };

  return (
    <section className="mx-auto mt-12 max-w-md rounded-3xl border border-brand-100 bg-white p-8 shadow-soft">
      <h1 className="text-3xl font-extrabold text-brand-800">Iniciar sesion</h1>
      <p className="mt-2 text-sm text-slate-500">Accede para gestionar tus reservas.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          placeholder="Email o usuario"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-brand-200 px-4 py-3"
          required
        />
        <input
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-brand-200 px-4 py-3"
          required
        />
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          className="w-full rounded-xl bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        No tienes cuenta? <Link className="font-semibold text-brand-700" href="/register">Registrate</Link>
      </p>
    </section>
  );
}
