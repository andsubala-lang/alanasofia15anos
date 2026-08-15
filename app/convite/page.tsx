"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type Familia = {
  id: string;
  nome: string;
  total_integrantes: number;
  respondidos: number;
};

type Integrante = {
  id: string;
  nome: string;
  vai_comparecer: boolean | null;
};

export default function ConvitePage() {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [familiaAberta, setFamiliaAberta] = useState<Familia | null>(null);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [carregandoIntegrantes, setCarregandoIntegrantes] = useState(false);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [totalConfirmados, setTotalConfirmados] = useState<number | null>(null);

  useEffect(() => {
    carregarFamilias();
    carregarContador();
  }, []);

  async function carregarFamilias() {
    setCarregando(true);
    const { data } = await supabase.rpc("listar_familias");
    setFamilias(data ?? []);
    setCarregando(false);
  }

  async function carregarContador() {
    const { data } = await supabase.rpc("contar_confirmados_pessoas");
    if (typeof data === "number") setTotalConfirmados(data);
  }

  async function abrirFamilia(f: Familia) {
    setFamiliaAberta(f);
    setCarregandoIntegrantes(true);
    const { data } = await supabase.rpc("listar_integrantes", { familia_id_busca: f.id });
    setIntegrantes(data ?? []);
    setCarregandoIntegrantes(false);
  }

  async function responder(integranteId: string, valor: boolean) {
    setEnviandoId(integranteId);
    const { error } = await supabase.rpc("responder_integrante", {
      integrante_id: integranteId,
      novo_valor: valor,
    });
    setEnviandoId(null);
    if (!error) {
      setIntegrantes((atual) =>
        atual.map((i) => (i.id === integranteId ? { ...i, vai_comparecer: valor } : i))
      );
      carregarContador();
      carregarFamilias();
    }
  }

  function voltar() {
    setFamiliaAberta(null);
    setIntegrantes([]);
  }

  const listaFiltrada = useMemo(() => {
    if (!busca.trim()) return familias;
    return familias.filter((f) => f.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [familias, busca]);

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

        {familiaAberta ? (
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

            <p className="font-display text-xl mb-1 text-center">{familiaAberta.nome}</p>
            <p className="text-steel text-xs text-center mb-5">
              Cada pessoa responde por si
            </p>

            {carregandoIntegrantes ? (
              <p className="text-steel text-sm text-center py-4">Carregando…</p>
            ) : (
              <div className="space-y-3">
                {integrantes.map((i) => (
                  <div
                    key={i.id}
                    className="border border-slateline rounded-lg px-3 py-3"
                  >
                    <p className="text-platinum text-sm font-medium mb-2">{i.nome}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => responder(i.id, true)}
                        disabled={enviandoId === i.id}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium border transition-colors disabled:opacity-40 ${
                          i.vai_comparecer === true
                            ? "bg-silver text-onyx border-silver"
                            : "border-slateline text-steel"
                        }`}
                      >
                        Vou
                      </button>
                      <button
                        onClick={() => responder(i.id, false)}
                        disabled={enviandoId === i.id}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium border transition-colors disabled:opacity-40 ${
                          i.vai_comparecer === false
                            ? "bg-graphite text-red-400 border-red-500/50"
                            : "border-slateline text-steel"
                        }`}
                      >
                        Não vou
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
              <p className="text-steel text-sm text-center py-4">Nenhuma família encontrada.</p>
            ) : (
              <div className="border border-slateline rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                {listaFiltrada.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => abrirFamilia(f)}
                    className="w-full text-left px-3 py-2.5 text-sm text-platinum hover:bg-graphite border-b border-slateline last:border-b-0 flex items-center justify-between gap-2"
                  >
                    <span>{f.nome}</span>
                    <span className="text-[10px] text-steel shrink-0">
                      {f.respondidos}/{f.total_integrantes} responderam
                    </span>
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
