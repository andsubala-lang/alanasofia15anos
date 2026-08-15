"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type Convidado = {
  id: string;
  grupo: string;
  integrantes: string | null;
  vai_comparecer: boolean | null;
};

export default function ConvitePage() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [grupoAberto, setGrupoAberto] = useState<Convidado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<boolean | null>(null);
  const [totalConfirmados, setTotalConfirmados] = useState<number | null>(null);

  useEffect(() => {
    carregarConvidados();
    carregarContador();
  }, []);

  async function carregarConvidados() {
    setCarregando(true);
    const { data } = await supabase.rpc("listar_convidados");
    setConvidados(data ?? []);
    setCarregando(false);
  }

  async function carregarContador() {
    const { data } = await supabase.rpc("contar_confirmados_convidados");
    if (typeof data === "number") setTotalConfirmados(data);
  }

  async function responder(valor: boolean) {
    if (!grupoAberto) return;
    setEnviando(true);
    const { error } = await supabase.rpc("responder_presenca", {
      convidado_id: grupoAberto.id,
      novo_valor: valor,
    });
    setEnviando(false);
    if (!error) {
      setEnviado(valor);
      carregarContador();
    }
  }

  function voltar() {
    setGrupoAberto(null);
    setEnviado(null);
  }

  const listaFiltrada = useMemo(() => {
    if (!busca.trim()) return convidados;
    return convidados.filter((c) =>
      c.grupo.toLowerCase().includes(busca.toLowerCase())
    );
  }, [convidados, busca]);

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

        {grupoAberto ? (
          <div className="text-left animate-fade-in-up">
            <button
              onClick={voltar}
              className="text-steel text-xs mb-4 inline-flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Voltar pra lista
            </button>

            {enviado !== null ? (
              <div className="text-center py-4">
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
              <>
                <p className="font-display text-xl mb-2 text-center">{grupoAberto.grupo}</p>
                {grupoAberto.integrantes && (
                  <p className="text-steel text-sm text-center mb-5">
                    {grupoAberto.integrantes}
                  </p>
                )}
                {grupoAberto.vai_comparecer !== null && (
                  <p className="text-steel text-xs text-center mb-3">
                    Última resposta:{" "}
                    <span className="text-platinum">
                      {grupoAberto.vai_comparecer ? "Vai comparecer" : "Não vai"}
                    </span>
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
              </>
            )}
          </div>
        ) : (
          <div className="text-left">
            <input
              type="text"
              placeholder="Filtrar (opcional)"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2.5 text-sm text-platinum placeholder:text-steel focus:outline-none mb-3"
            />

            {carregando ? (
              <p className="text-steel text-sm text-center py-4">Carregando…</p>
            ) : listaFiltrada.length === 0 ? (
              <p className="text-steel text-sm text-center py-4">Nenhum nome encontrado.</p>
            ) : (
              <div className="border border-slateline rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                {listaFiltrada.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setGrupoAberto(c)}
                    className="w-full text-left px-3 py-2.5 text-sm text-platinum hover:bg-graphite border-b border-slateline last:border-b-0 flex items-center justify-between gap-2"
                  >
                    <span>{c.grupo}</span>
                    {c.vai_comparecer !== null && (
                      <span
                        className={`text-[10px] shrink-0 ${
                          c.vai_comparecer ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {c.vai_comparecer ? "Vai" : "Não vai"}
                      </span>
                    )}
                  </button>
                ))}
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
