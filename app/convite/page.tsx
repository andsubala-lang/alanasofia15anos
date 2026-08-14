"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ENDERECO = "R. Sant'Anna, 65 - Casa Forte, Recife - PE, 52060-460";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ENDERECO
)}`;

type ModalAberto = "local" | "recomendacoes" | "presenca" | null;

export default function ConvitePage() {
  const [modal, setModal] = useState<ModalAberto>(null);

  const [nome, setNome] = useState("");
  const [vaiComparecer, setVaiComparecer] = useState<boolean | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

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
    } else {
      setErro("Algo deu errado. Tente novamente.");
    }
  }

  function fecharModal() {
    setModal(null);
    setEnviado(false);
    setErro("");
    setNome("");
    setVaiComparecer(null);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slateline">
        <img src="https://i.imgur.com/nqEkE7M.png" alt="Convite de 15 anos da Alana Sofia" className="w-full block" />

        <Link
          href="/"
          className="absolute flex flex-col items-center justify-center gap-1"
          style={{ top: "76.5%", left: "13.5%", width: "32%", height: "7.3%" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1F3F6" strokeWidth="2">
            <rect x="3" y="9" width="18" height="4" rx="1" />
            <rect x="5" y="13" width="14" height="8" rx="1" />
            <path d="M12 9v12" />
          </svg>
          <span className="text-[8px] text-platinum tracking-wide">PRESENTES</span>
        </Link>

        <button
          onClick={() => setModal("local")}
          className="absolute flex flex-col items-center justify-center gap-1"
          style={{ top: "76.5%", left: "53.5%", width: "32%", height: "7.3%" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1F3F6" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[8px] text-platinum tracking-wide">LOCAL</span>
        </button>

        <button
          onClick={() => setModal("recomendacoes")}
          className="absolute flex flex-col items-center justify-center gap-1"
          style={{ top: "86.3%", left: "13.5%", width: "32%", height: "7.3%" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1F3F6" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          <span className="text-[8px] text-platinum tracking-wide text-center">RECOMENDAÇÕES</span>
        </button>

        <button
          onClick={() => setModal("presenca")}
          className="absolute flex flex-col items-center justify-center gap-1"
          style={{ top: "86.3%", left: "53.5%", width: "32%", height: "7.3%" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F1F3F6" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m17 11 2 2 4-4" />
          </svg>
          <span className="text-[8px] text-platinum tracking-wide">PRESENÇA</span>
        </button>
      </div>

      {modal === "local" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/90 backdrop-blur-sm"
          onClick={fecharModal}
        >
          <div
            className="card-premium max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C7CCD6" strokeWidth="1.75" className="mx-auto mb-3">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="font-display text-2xl mb-2">Local da festa</p>
            <p className="text-steel text-sm mb-6">{ENDERECO}</p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-silver w-full rounded-lg py-2.5 text-sm font-medium inline-block"
            >
              Abrir no Google Maps
            </a>
            <button onClick={fecharModal} className="mt-3 text-steel text-sm">
              Fechar
            </button>
          </div>
        </div>
      )}

      {modal === "recomendacoes" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/90 backdrop-blur-sm"
          onClick={fecharModal}
        >
          <div
            className="card-premium max-w-sm w-full p-6 text-left max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-2xl mb-4 text-center">Recomendações</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7CCD6" strokeWidth="1.75" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <p className="text-steel text-sm leading-relaxed">
                  <span className="text-platinum font-medium">Seja pontual</span> — a festa começa às 21h.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7CCD6" strokeWidth="1.75" className="shrink-0 mt-0.5">
                  <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" />
                </svg>
                <p className="text-steel text-sm leading-relaxed">
                  <span className="text-platinum font-medium">Traje: esporte fino</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7CCD6" strokeWidth="1.75" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m4.9 4.9 14.2 14.2" />
                </svg>
                <p className="text-steel text-sm leading-relaxed">
                  <span className="text-platinum font-medium">Evite roupas pretas ou prateadas</span> — são as cores da decoração da festa.
                </p>
              </div>
            </div>
            <button onClick={fecharModal} className="mt-6 w-full text-steel text-sm border border-slateline rounded-lg py-2">
              Fechar
            </button>
          </div>
        </div>
      )}

      {modal === "presenca" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/90 backdrop-blur-sm"
          onClick={fecharModal}
        >
          <div
            className="card-premium max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {enviado ? (
              <div className="text-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C7CCD6" strokeWidth="1.75" className="mx-auto mb-3">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
                <p className="font-display text-2xl mb-2">Presença registrada!</p>
                <p className="text-steel text-sm mb-6">Obrigada por confirmar.</p>
                <button onClick={fecharModal} className="btn-silver w-full rounded-lg py-2.5 text-sm font-medium">
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={confirmarPresenca}>
                <p className="font-display text-2xl mb-4 text-center">Confirmar presença</p>
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
                <button
                  type="button"
                  onClick={fecharModal}
                  className="mt-3 w-full text-steel text-sm"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
