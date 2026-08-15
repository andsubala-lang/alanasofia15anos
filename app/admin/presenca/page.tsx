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
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [vaiEdicao, setVaiEdicao] = useState(true);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<Presenca | null>(null);

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

  function iniciarEdicao(p: Presenca) {
    setEditandoId(p.id);
    setNomeEdicao(p.nome);
    setVaiEdicao(p.vai_comparecer);
  }

  async function salvarEdicao(id: string) {
    await fetch(`/api/admin/presenca/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeEdicao.trim(), vai_comparecer: vaiEdicao }),
    });
    setEditandoId(null);
    carregar();
  }

  async function apagar(id: string) {
    await fetch(`/api/admin/presenca/${id}`, { method: "DELETE" });
    setConfirmandoExclusao(null);
    carregar();
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
                <th className="px-4 py-3">Ações</th>
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
                  {editandoId === p.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={nomeEdicao}
                          onChange={(e) => setNomeEdicao(e.target.value)}
                          className="bg-onyx border border-slateline rounded-lg px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setVaiEdicao(true)}
                            className={`text-xs px-2 py-1 rounded-lg border ${
                              vaiEdicao ? "bg-silver text-onyx border-silver" : "border-slateline text-steel"
                            }`}
                          >
                            Vai
                          </button>
                          <button
                            onClick={() => setVaiEdicao(false)}
                            className={`text-xs px-2 py-1 rounded-lg border ${
                              !vaiEdicao ? "bg-silver text-onyx border-silver" : "border-slateline text-steel"
                            }`}
                          >
                            Não vai
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-steel">
                        {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => salvarEdicao(p.id)}
                            className="border border-slateline rounded-lg px-2.5 py-1 text-xs"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="border border-slateline rounded-lg px-2.5 py-1 text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
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
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicao(p)}
                            className="border border-slateline rounded-lg px-2.5 py-1 text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusao(p)}
                            className="border border-red-500/50 text-red-400 rounded-lg px-2.5 py-1 text-xs"
                          >
                            Apagar
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmandoExclusao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/80 backdrop-blur-sm">
          <div className="bg-graphite border border-slateline rounded-xl max-w-sm w-full p-6">
            <h3 className="font-display text-xl mb-2">Apagar confirmação?</h3>
            <p className="text-steel text-sm mb-6">
              Tem certeza que quer apagar a resposta de "{confirmandoExclusao.nome}"? Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => apagar(confirmandoExclusao.id)}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
              >
                Apagar
              </button>
              <button
                onClick={() => setConfirmandoExclusao(null)}
                className="flex-1 border border-slateline rounded-lg py-2 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
