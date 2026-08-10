"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Presente = {
  id: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  link_compra: string | null;
  maps_url: string | null;
  reservado: boolean;
  reservado_por: string | null;
};

export default function Home() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [reservando, setReservando] = useState<string | null>(null);
  const [nomeInput, setNomeInput] = useState("");
  const [mensagemInput, setMensagemInput] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarPresentes();
    registrarVisita();
  }, []);

  async function carregarPresentes() {
    setCarregando(true);
    const { data } = await supabase
      .from("alana_presentes")
      .select("*")
      .order("ordem", { ascending: true })
      .order("criado_em", { ascending: true });
    setPresentes(data ?? []);
    setCarregando(false);
  }

  async function registrarVisita() {
    await supabase.from("alana_visitas").insert({});
  }

  async function confirmarReserva(id: string) {
    if (!nomeInput.trim()) return;
    setEnviando(true);
    const { error } = await supabase
      .from("alana_presentes")
      .update({
        reservado: true,
        reservado_por: nomeInput.trim(),
        reservado_mensagem: mensagemInput.trim() || null,
        reservado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("reservado", false);

    setEnviando(false);
    if (!error) {
      setReservando(null);
      setNomeInput("");
      setMensagemInput("");
      carregarPresentes();
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 md:py-24">
      {/* Hero */}
      <section className="max-w-2xl mx-auto text-center mb-20">
        <p className="uppercase tracking-[0.3em] text-steel text-xs mb-4">
          Convite
        </p>
        <h1 className="font-display text-shimmer text-6xl md:text-8xl font-semibold leading-none mb-4">
          Alana Sofia
        </h1>
        <p className="text-steel text-sm md:text-base tracking-wide">
          15 anos
        </p>
        <div className="w-16 h-px bg-slateline mx-auto mt-8" />
      </section>

      {/* Lista de presentes */}
      <section className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-2">
          Lista de presentes
        </h2>
        <p className="text-steel text-center text-sm mb-12">
          Escolha um presente para reservar. Cada item só pode ser escolhido por uma pessoa.
        </p>

        {carregando && (
          <p className="text-center text-steel">Carregando presentes…</p>
        )}

        {!carregando && presentes.length === 0 && (
          <p className="text-center text-steel">
            A lista de presentes ainda está sendo preparada. Volte em breve.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {presentes.map((p) => (
            <div
              key={p.id}
              className="bg-graphite border border-slateline rounded-xl overflow-hidden flex flex-col"
            >
              {p.imagem_url ? (
                <img
                  src={p.imagem_url}
                  alt={p.nome}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-onyx flex items-center justify-center text-steel text-sm">
                  Sem imagem
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display text-xl mb-1">{p.nome}</h3>
                {p.descricao && (
                  <p className="text-steel text-sm mb-4">{p.descricao}</p>
                )}

                <div className="flex gap-3 text-sm mb-4">
                  {p.link_compra && (
                    <a
                      href={p.link_compra}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-silver-bright underline underline-offset-4"
                    >
                      Ver na loja
                    </a>
                  )}
                  {p.maps_url && (
                    <a
                      href={p.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-silver-bright underline underline-offset-4"
                    >
                      Ver localização
                    </a>
                  )}
                </div>

                <div className="mt-auto">
                  {p.reservado ? (
                    <div className="text-center py-2 rounded-lg bg-onyx border border-slateline text-steel text-sm">
                      Reservado{p.reservado_por ? ` por ${p.reservado_por}` : ""}
                    </div>
                  ) : reservando === p.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={nomeInput}
                        onChange={(e) => setNomeInput(e.target.value)}
                        className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm text-platinum placeholder:text-steel focus:outline-none"
                      />
                      <textarea
                        placeholder="Mensagem de carinho (opcional)"
                        value={mensagemInput}
                        onChange={(e) => setMensagemInput(e.target.value)}
                        rows={2}
                        className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm text-platinum placeholder:text-steel focus:outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmarReserva(p.id)}
                          disabled={!nomeInput.trim() || enviando}
                          className="flex-1 bg-silver text-onyx font-medium rounded-lg py-2 text-sm disabled:opacity-40"
                        >
                          {enviando ? "Enviando…" : "Confirmar"}
                        </button>
                        <button
                          onClick={() => {
                            setReservando(null);
                            setNomeInput("");
                            setMensagemInput("");
                          }}
                          className="px-3 rounded-lg border border-slateline text-steel text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReservando(p.id)}
                      className="w-full bg-graphite border border-slateline hover:border-steel transition-colors rounded-lg py-2 text-sm text-platinum"
                    >
                      Reservar presente
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
