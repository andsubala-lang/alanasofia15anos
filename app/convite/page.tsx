"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Convidado = {
  id: string;
  grupo: string;
  vai_comparecer: boolean | null;
};

export default function ConvitePage() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Convidado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [selecionado, setSelecionado] = useState<Convidado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<boolean | null>(null);
  const [totalConfirmados, setTotalConfirmados] = useState<number | null>(null);

  useEffect(() => {
    carregarContador();
  }, []);

  useEffect(() => {
    if (selecionado) return;
    if (busca.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timeout = setTimeout(() => buscarConvidados(busca), 300);
    return () => clearTimeout(timeout);
  }, [busca, selecionado]);

  async function carregarContador() {
    const { data } = await supabase.rpc("contar_confirmados_convidados");
    if (typeof data === "number") setTotalConfirmados(data);
  }

  async function buscarConvidados(termo: string) {
    setBuscando(true);
    const { data } = await supabase.rpc("buscar_convidados", { termo });
    setResultados(data ?? []);
    setBuscando(false);
  }

  function escolherConvidado(c: Convidado) {
    setSelecionado(c);
    setBusca(c.grupo);
    setResultados([]);
  }

  function trocarBusca(valor: string) {
    setBusca(valor);
    if (selecionado) setSelecionado(null);
  }

  async function responder(valor: boolean) {
    if (!selecionado) return;
    setEnviando(true);
    const { error } = await supabase.rpc("responder_presenca", {
      convidado_id: selecionado.id,
      novo_valor: valor,
    });
    setEnviando(false);
    if (!error) {
      setEnviado(valor);
      carregarContador();
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

        {enviado !== null ? (
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
            <p className="font-display text-xl mb-2">
              {enviado ? "Presença confirmada!" : "Resposta registrada"}
            </p>
            <p className="text-steel text-sm">
              {enviado ? "Obrigada por confirmar." : "Sentiremos sua falta!"}
            </p>
          </div>
        ) : (
          <div className="text-left">
            <label className="block text-xs text-steel mb-2">
              Digite o nome que está no convite
            </label>
            <input
              type="text"
              placeholder="Ex: Ana Paula família"
              value={busca}
              onChange={(e) => trocarBusca(e.target.value)}
              className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2.5 text-sm text-platinum placeholder:text-steel focus:outline-none mb-2"
              autoComplete="off"
            />

            {!selecionado && busca.trim().length >= 2 && (
              <div className="border border-slateline rounded-lg overflow-hidden mb-3">
                {buscando && (
                  <p className="text-steel text-xs px-3 py-2.5">Buscando…</p>
                )}
                {!buscando && resultados.length === 0 && (
                  <p className="text-steel text-xs px-3 py-2.5">
                    Nenhum nome encontrado. Confira a grafia ou fale com quem te convidou.
                  </p>
                )}
                {!buscando &&
                  resultados.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => escolherConvidado(c)}
                      className="w-full text-left px-3 py-2.5 text-sm text-platinum hover:bg-graphite border-b border-slateline last:border-b-0"
                    >
                      {c.grupo}
                    </button>
                  ))}
              </div>
            )}

            {selecionado && (
              <div className="animate-fade-in-up">
                {selecionado.vai_comparecer !== null && (
                  <p className="text-steel text-xs mb-3">
                    Última resposta:{" "}
                    <span className="text-platinum">
                      {selecionado.vai_comparecer ? "Vai comparecer" : "Não vai"}
                    </span>{" "}
                    — pode alterar abaixo.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => responder(true)}
                    disabled={enviando}
                    className="btn-silver flex-1 rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
                  >
                    {enviando ? "Enviando…" : "Vou"}
                  </button>
                  <button
                    onClick={() => responder(false)}
                    disabled={enviando}
                    className="flex-1 rounded-lg py-2.5 text-sm border border-slateline text-steel disabled:opacity-40"
                  >
                    Não vou
                  </button>
                </div>
              </div>
            )}
          </div>
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
