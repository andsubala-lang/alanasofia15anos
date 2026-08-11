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
  onde_comprar: string | null;
  reservado: boolean;
  reservado_por: string | null;
};

type Filtro = "disponiveis" | "todos" | "reservados";

function gerarPontoGlitter() {
  return {
    top: `${(Math.random() * 96).toFixed(1)}%`,
    left: `${(Math.random() * 96).toFixed(1)}%`,
    delay: `${(Math.random() * 2.6).toFixed(1)}s`,
    grande: Math.random() > 0.5,
  };
}

export default function Home() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [reservando, setReservando] = useState<string | null>(null);
  const [nomeInput, setNomeInput] = useState("");
  const [mensagemInput, setMensagemInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [modalReserva, setModalReserva] = useState<{ nome: string } | null>(null);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("disponiveis");
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    carregarPresentes();
    registrarVisita();
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalReserva ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalReserva]);

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

  async function confirmarReserva(p: Presente) {
    if (!nomeInput.trim()) return;
    setEnviando(true);
    const { data, error } = await supabase
      .from("alana_presentes")
      .update({
        reservado: true,
        reservado_por: nomeInput.trim(),
        reservado_mensagem: mensagemInput.trim() || null,
        reservado_em: new Date().toISOString(),
      })
      .eq("id", p.id)
      .eq("reservado", false)
      .select()
      .maybeSingle();

    setEnviando(false);

    if (!error && data) {
      setReservando(null);
      setNomeInput("");
      setMensagemInput("");
      carregarPresentes();
      setModalReserva({ nome: p.nome });
    } else {
      setReservando(null);
      setNomeInput("");
      setMensagemInput("");
      setAviso("Ops! Esse presente acabou de ser reservado por outra pessoa. A lista foi atualizada.");
      carregarPresentes();
      setTimeout(() => setAviso(null), 5000);
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

  const [pontosGlitter, setPontosGlitter] = useState(() =>
    Array.from({ length: 26 }, gerarPontoGlitter)
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPontosGlitter((atual) => {
        const copia = [...atual];
        const indice = Math.floor(Math.random() * copia.length);
        copia[indice] = gerarPontoGlitter();
        return copia;
      });
    }, 450);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      {/* Marca d'água do monograma, bem apagada, atrás de tudo */}
      <div
        className="fixed inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none"
        style={{ zIndex: -2 }}
        aria-hidden="true"
      >
        <span
          className="font-display leading-none"
          style={{ fontSize: "min(70vw, 420px)", color: "rgba(228, 231, 236, 0.03)" }}
        >
          AS
        </span>
      </div>

      {/* Glitter sutil no fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }} aria-hidden="true">
        {pontosGlitter.map((s, i) => (
          <span
            key={i}
            className="sparkle-dot"
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
              width: s.grande ? "2px" : "1.4px",
              height: s.grande ? "2px" : "1.4px",
            }}
          />
        ))}
      </div>

      {/* Modal de agradecimento */}
      {modalReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/90 backdrop-blur-sm animate-fade-in-up">
          <div className="card-premium max-w-sm w-full p-6 sm:p-8 text-center animate-celebrate">
            <div className="mx-auto w-14 h-14 rounded-full border border-slateline flex items-center justify-center mb-4">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="text-silver-bright"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 3 3 5-6" />
              </svg>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl mb-2">
              Presente reservado!
            </h2>
            <p className="text-steel text-xs sm:text-sm mb-1">Você reservou:</p>
            <p className="text-platinum font-medium mb-5">{modalReserva.nome}</p>
            <p className="text-steel text-xs sm:text-sm mb-6 leading-relaxed">
              Obrigada por fazer parte dos 15 anos da Alana Sofia. ✦
            </p>
            <button
              onClick={() => setModalReserva(null)}
              className="btn-silver w-full rounded-lg py-2.5 text-sm font-medium"
            >
              Voltar para a lista
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
        <div className="mx-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-steel/60 bg-graphite/60 flex items-center justify-center mb-4 relative animate-fade-in-up">
          <div className="absolute inset-[3px] rounded-full border border-slateline/70"></div>
          <span className="relative font-display text-shimmer text-base sm:text-lg">AS</span>
        </div>
        <div className="mb-7 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <p className="font-display text-shimmer text-xl sm:text-2xl font-medium mb-1.5">
            Alana Sofia
          </p>
          <p className="text-steel text-[11px] sm:text-xs tracking-[0.25em] uppercase">
            15 anos
          </p>
        </div>
        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-display text-shimmer text-4xl sm:text-5xl md:text-7xl font-semibold leading-[0.95]">
            Lista de presentes
          </h1>
        </div>

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
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
          style={{ animationDelay: "0.2s" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.45 1.33 4.95L2 22l5.2-1.36a9.96 9.96 0 0 0 4.84 1.24h.01c5.52 0 10-4.48 10-10s-4.49-9.88-10.01-9.88Zm5.85 14.1c-.25.7-1.45 1.35-2 1.44-.55.09-1.15.13-1.85-.11-.43-.14-.98-.33-1.68-.65-2.96-1.28-4.89-4.25-5.04-4.45-.15-.2-1.21-1.6-1.21-3.06s.76-2.17 1.03-2.47c.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.06.92 2.21.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.53-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.48.13.65-.08.18-.2.75-.87.95-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.23.57.35.08.13.08.72-.17 1.42Z" />
          </svg>
          Compartilhar no WhatsApp
        </button>
      </section>

      {/* Aviso pra quem vai comprar pessoalmente */}
      <div
        className="card-premium max-w-md mx-auto mb-10 px-4 py-3.5 flex items-start gap-3 text-left animate-fade-in-up"
        style={{ animationDelay: "0.25s" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="text-steel shrink-0 mt-0.5"
        >
          <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
        </svg>
        <p className="text-xs sm:text-sm text-steel leading-snug">
          Vai comprar pessoalmente? Reserve aqui para que ninguém escolha o mesmo presente.
        </p>
      </div>

      {/* Lista de presentes */}
      <section className="max-w-4xl mx-auto">
        {/* Busca e filtros — fixos ao rolar, pra ficar sempre à mão no celular */}
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 bg-onyx/85 backdrop-blur-sm border-b border-slateline/60">
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
                  { valor: "disponiveis", rotulo: "Disponíveis" },
                  { valor: "todos", rotulo: "Todos" },
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

        {aviso && (
          <div className="max-w-md mx-auto mb-6 text-center text-xs sm:text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 animate-fade-in-up">
            {aviso}
          </div>
        )}

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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {presentesFiltrados.map((p, i) => (
            <div
              key={p.id}
              className="card-premium overflow-hidden flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
            >
              <div className="relative aspect-square bg-onyx">
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-steel text-xs">
                    Sem imagem
                  </div>
                )}
                {p.reservado && (
                  <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-onyx/80 backdrop-blur-sm border border-slateline text-steel">
                    Reservado
                  </span>
                )}
              </div>

              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h3 className="font-body font-extrabold text-sm sm:text-base mb-1 leading-tight text-platinum">
                  {p.nome}
                </h3>
                {p.onde_comprar && (
                  <div className="flex items-start gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg border border-steel/40 bg-onyx/60">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0 mt-0.5 text-silver-bright"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="text-platinum text-xs sm:text-sm font-medium leading-snug">
                      {p.onde_comprar}
                    </p>
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  {p.link_compra && (
                    <a
                      href={p.link_compra}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-lg border border-slateline text-platinum hover:border-steel active:scale-[0.98] transition-all"
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
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-lg border border-slateline text-platinum hover:border-steel active:scale-[0.98] transition-all"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Localização
                    </a>
                  )}

                  {p.reservado ? (
                    <div className="text-center py-2.5 rounded-lg bg-onyx border border-slateline text-steel text-xs sm:text-sm">
                      Reservado
                    </div>
                  ) : reservando === p.id ? (
                    <div className="space-y-2 animate-fade-in-up">
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={nomeInput}
                        onChange={(e) => setNomeInput(e.target.value)}
                        className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2 text-xs sm:text-sm text-platinum placeholder:text-steel focus:outline-none"
                      />
                      <textarea
                        placeholder="Mensagem de carinho (opcional)"
                        value={mensagemInput}
                        onChange={(e) => setMensagemInput(e.target.value)}
                        rows={2}
                        className="w-full bg-onyx border border-slateline rounded-lg px-3 py-2 text-xs sm:text-sm text-platinum placeholder:text-steel focus:outline-none resize-none"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => confirmarReserva(p)}
                          disabled={!nomeInput.trim() || enviando}
                          className="btn-silver flex-1 font-medium rounded-lg py-2 text-xs sm:text-sm"
                        >
                          {enviando ? "Enviando…" : "Confirmar"}
                        </button>
                        <button
                          onClick={() => {
                            setReservando(null);
                            setNomeInput("");
                            setMensagemInput("");
                          }}
                          className="px-3 rounded-lg border border-slateline text-steel text-xs sm:text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReservando(p.id)}
                      className="w-full bg-graphite border border-slateline hover:border-steel active:scale-[0.98] transition-all rounded-lg py-2 text-xs sm:text-sm text-platinum"
                    >
                      Reservar
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
