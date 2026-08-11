"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Presente = {
  id: string;
  nome: string;
  reservado: boolean;
  reservado_por: string | null;
  reservado_mensagem: string | null;
  reservado_em: string | null;
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
      <p className="font-display text-4xl mb-1">{value}</p>
      <p className="text-steel text-xs uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);

    const { data } = await supabase
      .from("alana_presentes")
      .select("id, nome, reservado, reservado_por, reservado_mensagem, reservado_em");

    setPresentes(data ?? []);
    setCarregando(false);
  }

  const total = presentes.length;
  const reservados = presentes.filter((p) => p.reservado).length;
  const disponiveis = total - reservados;
  const comMensagem = presentes.filter(
    (p) => p.reservado_mensagem && p.reservado_mensagem.trim() !== ""
  ).length;
  const percentualReservado = total > 0 ? Math.round((reservados / total) * 100) : 0;

  const ultimasReservas = [...presentes]
    .filter((p) => p.reservado && p.reservado_em)
    .sort(
      (a, b) =>
        new Date(b.reservado_em as string).getTime() -
        new Date(a.reservado_em as string).getTime()
    )
    .slice(0, 5);

  const ultimasMensagens = [...presentes]
    .filter((p) => p.reservado_mensagem && p.reservado_mensagem.trim() !== "" && p.reservado_em)
    .sort(
      (a, b) =>
        new Date(b.reservado_em as string).getTime() -
        new Date(a.reservado_em as string).getTime()
    )
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total de presentes" value={total} />
            <StatCard label="Reservados" value={reservados} />
            <StatCard label="Disponíveis" value={disponiveis} />
            <StatCard label="Com mensagem" value={comMensagem} />
          </div>

          <div className="bg-graphite border border-slateline rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl">Progresso das reservas</h2>
              <span className="text-steel text-sm">{percentualReservado}% reservado</span>
            </div>
            <div className="w-full h-2 rounded-full bg-onyx overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${percentualReservado}%`,
                  background: "linear-gradient(90deg, #8A93A3, #F1F3F6, #C7CCD6)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-graphite border border-slateline rounded-xl p-6">
              <h2 className="font-display text-xl mb-4">Últimas reservas</h2>
              {ultimasReservas.length === 0 ? (
                <p className="text-steel text-sm">Nenhuma reserva ainda.</p>
              ) : (
                <div className="space-y-4">
                  {ultimasReservas.map((p) => (
                    <div key={p.id} className="border-b border-slateline last:border-b-0 pb-4 last:pb-0">
                      <p className="font-medium">{p.reservado_por}</p>
                      <p className="text-sm text-steel">{p.nome}</p>
                      {p.reservado_em && (
                        <p className="text-xs text-steel mt-1">
                          {new Date(p.reservado_em).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-graphite border border-slateline rounded-xl p-6">
              <h2 className="font-display text-xl mb-4">Últimas mensagens</h2>
              {ultimasMensagens.length === 0 ? (
                <p className="text-steel text-sm">Nenhuma mensagem ainda.</p>
              ) : (
                <div className="space-y-4">
                  {ultimasMensagens.map((p) => (
                    <div key={p.id} className="border-b border-slateline last:border-b-0 pb-4 last:pb-0">
                      <p className="font-medium">{p.reservado_por}</p>
                      <p className="text-sm text-steel italic">"{p.reservado_mensagem}"</p>
                      {p.reservado_em && (
                        <p className="text-xs text-steel mt-1">
                          {new Date(p.reservado_em).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
