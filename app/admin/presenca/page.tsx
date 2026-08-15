"use client";

import { useEffect, useState, useMemo, FormEvent } from "react";

type Convidado = {
  id: string;
  grupo: string;
  integrantes: string | null;
  vai_comparecer: boolean | null;
  respondido_em: string | null;
};

export default function PresencaPage() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [grupoEdicao, setGrupoEdicao] = useState("");
  const [integrantesEdicao, setIntegrantesEdicao] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<Convidado | null>(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoGrupo, setNovoGrupo] = useState("");
  const [novosIntegrantes, setNovosIntegrantes] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/admin/convidados");
    const data = await res.json();
    setConvidados(data.convidados ?? []);
    setCarregando(false);
  }

  function iniciarEdicao(c: Convidado) {
    setEditandoId(c.id);
    setGrupoEdicao(c.grupo);
    setIntegrantesEdicao(c.integrantes ?? "");
  }

  async function salvarEdicao(id: string) {
    await fetch(`/api/admin/convidados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupo: grupoEdicao.trim(), integrantes: integrantesEdicao.trim() || null }),
    });
    setEditandoId(null);
    carregar();
  }

  async function apagar(id: string) {
    await fetch(`/api/admin/convidados/${id}`, { method: "DELETE" });
    setConfirmandoExclusao(null);
    carregar();
  }

  async function adicionarConvidado(e: FormEvent) {
    e.preventDefault();
    if (!novoGrupo.trim()) return;
    setSalvando(true);
    await fetch("/api/admin/convidados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupo: novoGrupo.trim(), integrantes: novosIntegrantes.trim() || null }),
    });
    setSalvando(false);
    setNovoGrupo("");
    setNovosIntegrantes("");
    setMostrarForm(false);
    carregar();
  }

  function exportarCSV() {
    const cabecalho = ["Grupo", "Integrantes", "Status", "Respondido em"];
    const linhas = convidados.map((c) => [
      c.grupo,
      c.integrantes ?? "",
      c.vai_comparecer === null ? "Pendente" : c.vai_comparecer ? "Vai comparecer" : "Não vai",
      c.respondido_em ? new Date(c.respondido_em).toLocaleString("pt-BR") : "",
    ]);

    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "confirmacoes-presenca-alana-sofia.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const total = convidados.length;
  const vao = convidados.filter((c) => c.vai_comparecer === true).length;
  const naoVao = convidados.filter((c) => c.vai_comparecer === false).length;
  const pendente = total - vao - naoVao;

  const listaExibida = useMemo(() => {
    return convidados.filter(
      (c) =>
        c.grupo.toLowerCase().includes(busca.toLowerCase()) ||
        (c.integrantes ?? "").toLowerCase().includes(busca.toLowerCase())
    );
  }, [convidados, busca]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Presença</h1>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            disabled={convidados.length === 0}
            className="text-sm border border-slateline rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="text-sm bg-silver text-onyx font-medium rounded-lg px-4 py-2"
          >
            + Convidado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{total}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Total de grupos</p>
        </div>
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{vao}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Vão comparecer</p>
        </div>
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{naoVao}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Não vão</p>
        </div>
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{pendente}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Pendentes</p>
        </div>
      </div>

      {mostrarForm && (
        <form
          onSubmit={adicionarConvidado}
          className="bg-graphite border border-slateline rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            placeholder="Nome do grupo/família (ex: Paulo César família)"
            value={novoGrupo}
            onChange={(e) => setNovoGrupo(e.target.value)}
            className="bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="Integrantes (opcional, ex: Paulo César, Claudilene)"
            value={novosIntegrantes}
            onChange={(e) => setNovosIntegrantes(e.target.value)}
            className="bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm"
          />
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="bg-silver text-onyx font-medium rounded-lg px-5 py-2 text-sm disabled:opacity-40"
            >
              {salvando ? "Salvando…" : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="border border-slateline rounded-lg px-5 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <input
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full md:w-80 bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm text-platinum placeholder:text-steel focus:outline-none mb-6"
      />

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : convidados.length === 0 ? (
        <p className="text-steel">Nenhum convidado cadastrado ainda.</p>
      ) : listaExibida.length === 0 ? (
        <p className="text-steel">Nenhum resultado para "{busca}".</p>
      ) : (
        <div className="bg-graphite border border-slateline rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slateline text-steel uppercase text-xs">
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Integrantes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaExibida.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-slateline last:border-b-0 ${
                    i % 2 === 0 ? "bg-graphite" : "bg-onyx/40"
                  }`}
                >
                  {editandoId === c.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={grupoEdicao}
                          onChange={(e) => setGrupoEdicao(e.target.value)}
                          className="bg-onyx border border-slateline rounded-lg px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={integrantesEdicao}
                          onChange={(e) => setIntegrantesEdicao(e.target.value)}
                          className="bg-onyx border border-slateline rounded-lg px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="px-4 py-3 text-steel text-xs">
                        {c.vai_comparecer === null ? "Pendente" : c.vai_comparecer ? "Vai" : "Não vai"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => salvarEdicao(c.id)}
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
                      <td className="px-4 py-3 font-medium">{c.grupo}</td>
                      <td className="px-4 py-3 text-steel text-xs">{c.integrantes ?? "—"}</td>
                      <td className="px-4 py-3">
                        {c.vai_comparecer === null ? (
                          <span className="text-xs px-2 py-1 rounded-full border border-slateline text-steel">
                            Pendente
                          </span>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              c.vai_comparecer
                                ? "border-emerald-500/40 text-emerald-400"
                                : "border-red-500/40 text-red-400"
                            }`}
                          >
                            {c.vai_comparecer ? "Vai comparecer" : "Não vai"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicao(c)}
                            className="border border-slateline rounded-lg px-2.5 py-1 text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmandoExclusao(c)}
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
            <h3 className="font-display text-xl mb-2">Apagar convidado?</h3>
            <p className="text-steel text-sm mb-6">
              Tem certeza que quer apagar "{confirmandoExclusao.grupo}"? Essa ação não pode ser desfeita.
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
