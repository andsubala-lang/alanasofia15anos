"use client";

import { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function ConvitePage() {
  const [nome, setNome] = useState("");
  const [vaiComparecer, setVaiComparecer] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [totalConfirmados, setTotalConfirmados] = useState<number | null>(null);

  useEffect(() => {
    carregarContador();
  }, []);

  async function carregarContador() {
    const { data } = await supabase.rpc("contar_confirmados");
    if (typeof data === "number") setTotalConfirmados(data);
  }

  async function confirmarPresenca(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Digite seu nome");
      return;
    }
    if (vaiComparecer === null) {
      setErro('Escolha "Vou" ou "Não vou"');
      return;
    }

    setEnviando(true);
    const { error } = await supabase.from("alana_presenca").insert({
      nome: nome.trim(),
      vai_comparecer: vaiComparecer,
    });
    setEnviando(false);

    if (!error) {
      setEnviado(true);
      carregarContador();
    } else {
      setErro("Algo deu errado. Tente novamente.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="card-premium max-w-sm w-full p-6 sm:p-8 text-center animate-fade-in-up">
        <div className="mx-auto w-11 h-11 rounded-full border border-slateline flex items-center justify-center mb-4">
          <span className="font-display text-shimmer text-base">AS</span>
        </div>
        <p className="text-steel text-xs tracking-[0.15em] uppercase mb-1">
          Alana Sofia · 15 anos
        </p>
        <h1 className="font-display text-2xl sm:text-3xl mb-6">
          Confirme sua presença
        </h1>

        {enviado ? (
          <div>
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C7CCD6"
              strokeWidth="1.75"
              className="mx-auto mb-3"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 3 3 5-6" />
            </svg>
            <p className="font-display text-xl mb-2">Presença registrada!</p>
            <p className="text-steel text-sm">Obrigada por confirmar.</p>
          </div>
        ) : (
          <form onSubmit={confirmarPresenca} className="text-left">
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2.5 text-sm text-platinum placeholder:text-steel focus:outline-none mb-3"
            />
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setVaiComparecer(true)}
                className={`flex-1 rounded-lg py-2.5 text-sm border transition-colors ${
                  vaiComparecer === true
                    ? "bg-silver text-onyx border-silver"
                    : "border-slateline text-steel"
                }`}
              >
                Vou
              </button>
              <button
                type="button"
                onClick={() => setVaiComparecer(false)}
                className={`flex-1 rounded-lg py-2.5 text-sm border transition-colors ${
                  vaiComparecer === false
                    ? "bg-silver text-onyx border-silver"
                    : "border-slateline text-steel"
                }`}
              >
                Não vou
              </button>
            </div>
            {erro && <p className="text-red-400 text-xs mb-3">{erro}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="btn-silver w-full rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </form>
        )}

        {totalConfirmados !== null && totalConfirmados > 0 && (
          <p className="text-steel text-xs mt-6">
            {totalConfirmados}{" "}
            {totalConfirmados === 1 ? "pessoa já confirmou" : "pessoas já confirmaram"} presença
          </p>
        )}
      </div>
    </main>
  );
}
