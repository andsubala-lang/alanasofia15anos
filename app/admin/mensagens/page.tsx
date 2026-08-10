"use client";

import { useEffect, useState, useMemo } from "react";

type Presente = {
  id: string;
  nome: string;
  reservado: boolean;
  reservado_por: string | null;
  reservado_mensagem: string | null;
  reservado_em: string | null;
};

export default function MensagensPage() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/admin/presentes");
    const data = await res.json();
    setPresentes(data.presentes ?? []);
    setCarregando(false);
  }

  const mensagens = useMemo(() => {
    return presentes
      .filter((p) => p.reservado && p.reservado_mensagem && p.reservado_mensagem.trim() !== "")
      .filter((p) =>
        (p.reservado_por ?? "").toLowerCase().includes(busca.toLowerCase())
      )
      .sort((a, b) => {
        const da = a.reservado_em ? new Date(a.reservado_em).getTime() : 0;
        const db = b.reservado_em ? new Date(b.reservado_em).getTime() : 0;
        return db - da;
      });
  }, [presentes, busca]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Mensagens</h1>
        <span className="text-sm text-steel">
          {mensagens.length} {mensagens.length === 1 ? "mensagem" : "mensagens"}
        </span>
      </div>

      <input
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full md:w-80 bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm text-platinum placeholder:text-steel focus:outline-none mb-8"
      />

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : mensagens.length === 0 ? (
        <p className="text-steel">
          Nenhuma mensagem ainda. Elas aparecem aqui quando alguém reserva um
          presente e deixa um recado.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mensagens.map((p) => (
            <div
              key={p.id}
              className="bg-graphite border border-slateline rounded-xl p-5"
            >
              <p className="font-medium text-platinum">{p.reservado_por}</p>
              <p className="text-xs text-steel uppercase tracking-wide mb-3">
                {p.nome}
              </p>
              <p className="text-sm text-steel italic mb-3">
                "{p.reservado_mensagem}"
              </p>
              {p.reservado_em && (
                <p className="text-xs text-steel">
                  {new Date(p.reservado_em).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
