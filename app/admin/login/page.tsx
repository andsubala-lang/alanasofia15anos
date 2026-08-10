"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: senha }),
    });

    setEnviando(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setErro("Senha incorreta. Tente novamente.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-graphite border border-slateline rounded-xl p-8"
      >
        <h1 className="font-display text-shimmer text-3xl text-center mb-1">
          Alana Sofia
        </h1>
        <p className="text-steel text-center text-sm mb-8">
          Painel administrativo
        </p>

        <label className="block text-sm text-steel mb-2" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2 text-platinum focus:outline-none mb-4"
          autoFocus
        />

        {erro && <p className="text-sm text-red-400 mb-4">{erro}</p>}

        <button
          type="submit"
          disabled={enviando || !senha}
          className="w-full bg-silver text-onyx font-medium rounded-lg py-2 disabled:opacity-40"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
