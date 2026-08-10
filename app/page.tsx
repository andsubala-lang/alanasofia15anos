"use client";

import { useEffect, useMemo, useState } from "react";
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

type Filtro = "todos" | "disponiveis" | "reservados";

export default function Home() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [reservando, setReservando] = useState<string | null>(null);
  const [nomeInput, setNomeInput] = useState("");
  const [mensagemInput, setMensagemInput] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

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

  const presentesFiltrados = useMemo(() => {
    return presentes
      .filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
      .filter((p) => {
        if (filtro === "disponiveis") return !p.reservado;
        if (filtro === "reservados") return p.reservado;
        return true;
      });
  }, [presentes, busca, filtro]);

  return (
    <main className="min-h-screen px-5 sm:px-6 py-12 sm:py-16 md:py-24">
      {/* Hero */}
      <section className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 md:mb-20">
        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slateline flex items-center justify-center mb-5 animate-fade-in-up">
          <span className="font-display text-shimmer text-lg sm:text-xl">AS</span>
        </div>
        <p
          className="uppercase tracking-[0.3em] text-steel text-[10px] sm:text-xs mb-3 animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          Convite
        </p>
        <h1
          className="font-display text-shimmer text-5xl sm:text-6xl md:text-8xl font-semibold leading-[0.95] mb-3 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Alana Sofia
        </h1>
        <p
          className="text-steel text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          15 anos
        </p>

        <div className="mt-6 sm:mt-8 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="divider-flourish">
            <span className="text-steel text-xs">✦</span>
          </div>
        </div>

        <button
          onClick={() => {
            const texto = encodeURIComponent(
              `Confira a lista de presentes da festa de 15 anos da Alana Sofia: ${window.location.href}`
            );
            window.open(`https://wa.me/?text=${texto}`, "_blank");
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 rounded-full border border-slateline text-steel hover:text-platinum hover:border-steel active:scale-[0.97] transition-all animate-fade-in-up"
          style={{ animationDelay: "0.25s" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.45 1.33 4.95L2 22l5.2-1.36a9.96 9.96 0 0 0 4.84 1.24h.01c5.52 0 10-4.48 10-10s-4.49-9.88-10.01-9.88Zm5.85 14.1c-.25.7-1.45 1.35-2 1.44-.55.09-1.15.13-1.85-.11-.43-.14-.98-.33-1.68-.65-2.96-1.28-4.89-4.25-5.04-4.45-.15-.2-1.21-1.6-1.21-3.06s.76-2.17 1.03-2.47c.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.53-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.48.13.65-.08.18-.2.75-.87.95-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.23.57.35.08.13.08.72-.17 1.42Z" />
          </svg>
          Compartilhar no WhatsApp
        </button>
      </section>

      {/* Lista de presentes */}
      <section className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-center mb-2">
          Lista de presentes
        </h2>
        <p className="text-steel text-center text-xs sm:text-sm mb-8 px-4">
          Escolha um presente para reservar. Cada item só pode ser escolhido por uma pessoa.
        </p>

        {/* Busca e filtros — fixos ao rolar, pra ficar sempre à mão no celular */}
        <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 mb-8 bg-onyx/85 backdrop-blur-sm border-b border-slateline/60">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                placeholder="Buscar presente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-graphite border border-slateline rounded-lg pl-10 pr-4 py-2.5 text-sm text-platinum placeholder:text-steel focus:outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {(
                [
                  { valor: "todos", rotulo: "Todos" },
                  { valor: "disponiveis", rotulo: "Disponíveis" },
                  { valor: "reservados", rotulo: "Reservados" },
                ] as { valor: Filtro; rotulo: string }[]
              ).map((opcao) => (
                <button
                  key={opcao.valor}
                  onClick={() => setFiltro(opcao.valor)}
                  className={`px-4 py-2.5 rounded-lg text-sm border transition-colors whitespace-nowrap ${
                    filtro === opcao.valor
                      ? "bg-silver text-onyx border-silver"
                      : "border-slateline text-steel hover:text-platinum"
                  }`}
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {carregando && (
          <p className="text-center text-steel text-sm">Carregando presentes…</p>
        )}

        {!carregando && presentes.length === 0 && (
          <p className="text-center text-steel text-sm px-6">
            A lista de presentes ainda está sendo preparada. Volte em breve.
          </p>
        )}

        {!carregando && presentes.length > 0 && presentesFiltrados.length === 0 && (
          <p className="text-center text-steel text-sm px-6">
            Nenhum presente encontrado para essa busca/filtro.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {presentesFiltrados.map((p, i) => (
            <div
              key={p.id}
              className="card-premium overflow-hidden flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
            >
              <div className="relative aspect-[4/3] bg-onyx">
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-steel text-sm">
                    Sem imagem
                  </div>
                )}
                {p.reservado && (
                  <span className="absolute top-3 left-3 text-[11px] px-2.5 py-1 rounded-full bg-onyx/80 backdrop-blur-sm border border-slateline text-steel">
                    Reservado
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-display text-lg sm:text-xl mb-1 leading-tight">
                  {p.nome}
                </h3>
                {p.descricao && (
                  <p className="text-steel text-sm mb-3 leading-snug">{p.descricao}</p>
                )}

                {(p.link_compra || p.maps_url) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.link_compra && (
                      <a
                        href={p.link_compra}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slateline text-silver-bright hover:border-steel transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                        </svg>
                        Ver na loja
                      </a>
                    )}
                    {p.maps_url && (
                      <a
                        href={p.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slateline text-silver-bright hover:border-steel transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Localização
                      </a>
                    )}
                  </div>
                )}

                <div className="mt-auto">
                  {p.reservado ? (
                    <div className="text-center py-2.5 rounded-lg bg-onyx border border-slateline text-steel text-sm">
                      Reservado{p.reservado_por ? ` por ${p.reservado_por}` : ""}
                    </div>
                  ) : reservando === p.id ? (
                    <div className="space-y-2 animate-fade-in-up">
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={nomeInput}
                        onChange={(e) => setNomeInput(e.target.value)}
                        className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2.5 text-sm text-platinum placeholder:text-steel focus:outline-none"
                      />
                      <textarea
                        placeholder="Mensagem de carinho (opcional)"
                        value={mensagemInput}
                        onChange={(e) => setMensagemInput(e.target.value)}
                        rows={2}
                        className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2.5 text-sm text-platinum placeholder:text-steel focus:outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmarReserva(p.id)}
                          disabled={!nomeInput.trim() || enviando}
                          className="btn-silver flex-1 font-medium rounded-lg py-2.5 text-sm"
                        >
                          {enviando ? "Enviando…" : "Confirmar"}
                        </button>
                        <button
                          onClick={() => {
                            setReservando(null);
                            setNomeInput("");
                            setMensagemInput("");
                          }}
                          className="px-3.5 rounded-lg border border-slateline text-steel text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReservando(p.id)}
                      className="w-full bg-graphite border border-slateline hover:border-steel active:scale-[0.98] transition-all rounded-lg py-2.5 text-sm text-platinum"
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
