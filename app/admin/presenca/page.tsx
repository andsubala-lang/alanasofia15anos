"use client";

import { useEffect, useState } from "react";

type Presenca = {
  id: string;
  nome: string;
  vai_comparecer: boolean;
  criado_em: string;
};

export default function PresencaPage() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/admin/presenca");
    const data = await res.json();
    setPresencas(data.presencas ?? []);
    setCarregando(false);
  }

  function exportarCSV() {
    const cabecalho = ["Nome", "Vai comparecer", "Data"];
    const linhas = presencas.map((p) => [
      p.nome,
      p.vai_comparecer ? "Sim" : "Não",
      new Date(p.criado_em).toLocaleString("pt-BR"),
    ]);

    const csv = [cabecalho, ...linhas]
      .map((linha) =>
        linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmacoes-presenca-alana-sofia.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const total = presencas.length;
  const vao = presencas.filter((p) => p.vai_comparecer).length;
  const naoVao = total - vao;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Presença</h1>
        <button
          onClick={exportarCSV}
          disabled={presencas.length === 0}
          className="text-sm border border-slateline rounded-lg px-4 py-2 disabled:opacity-40"
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{total}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Total de respostas</p>
        </div>
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{vao}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Vão comparecer</p>
        </div>
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{naoVao}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Não vão</p>
        </div>
      </div>

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : presencas.length === 0 ? (
        <p className="text-steel">Nenhuma confirmação ainda.</p>
      ) : (
        <div className="bg-graphite border border-slateline rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slateline text-steel uppercase text-xs">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {presencas.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-slateline last:border-b-0 ${
                    i % 2 === 0 ? "bg-graphite" : "bg-onyx/40"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        p.vai_comparecer
                          ? "border-emerald-500/40 text-emerald-400"
                          : "border-red-500/40 text-red-400"
                      }`}
                    >
                      {p.vai_comparecer ? "Vai comparecer" : "Não vai"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-steel">
                    {new Date(p.criado_em).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
