"use client";

import { useEffect, useState, useMemo, FormEvent } from "react";

type Familia = { id: string; nome: string };
type Integrante = {
  id: string;
  familia_id: string;
  nome: string;
  vai_comparecer: boolean | null;
  respondido_em: string | null;
};

export default function PresencaPage() {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [expandida, setExpandida] = useState<string | null>(null);

  const [editandoFamiliaId, setEditandoFamiliaId] = useState<string | null>(null);
  const [nomeFamiliaEdicao, setNomeFamiliaEdicao] = useState("");
  const [editandoIntegranteId, setEditandoIntegranteId] = useState<string | null>(null);
  const [nomeIntegranteEdicao, setNomeIntegranteEdicao] = useState("");
  const [novoIntegranteNome, setNovoIntegranteNome] = useState("");
  const [familiaParaNovoIntegrante, setFamiliaParaNovoIntegrante] = useState<string | null>(null);

  const [confirmandoExclusaoFamilia, setConfirmandoExclusaoFamilia] = useState<Familia | null>(null);
  const [confirmandoExclusaoIntegrante, setConfirmandoExclusaoIntegrante] = useState<Integrante | null>(null);

  const [mostrarFormFamilia, setMostrarFormFamilia] = useState(false);
  const [novoNomeFamilia, setNovoNomeFamilia] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/admin/familias");
    const data = await res.json();
    setFamilias(data.familias ?? []);
    setIntegrantes(data.integrantes ?? []);
    setCarregando(false);
  }

  async function adicionarFamilia(e: FormEvent) {
    e.preventDefault();
    if (!novoNomeFamilia.trim()) return;
    setSalvando(true);
    await fetch("/api/admin/familias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNomeFamilia.trim(), integrantes: [] }),
    });
    setSalvando(false);
    setNovoNomeFamilia("");
    setMostrarFormFamilia(false);
    carregar();
  }

  async function salvarFamilia(id: string) {
    await fetch(`/api/admin/familias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeFamiliaEdicao.trim() }),
    });
    setEditandoFamiliaId(null);
    carregar();
  }

  async function apagarFamilia(id: string) {
    await fetch(`/api/admin/familias/${id}`, { method: "DELETE" });
    setConfirmandoExclusaoFamilia(null);
    carregar();
  }

  async function salvarIntegrante(id: string) {
    await fetch(`/api/admin/integrantes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nomeIntegranteEdicao.trim() }),
    });
    setEditandoIntegranteId(null);
    carregar();
  }

  async function apagarIntegrante(id: string) {
    await fetch(`/api/admin/integrantes/${id}`, { method: "DELETE" });
    setConfirmandoExclusaoIntegrante(null);
    carregar();
  }

  async function adicionarIntegrante(familiaId: string) {
    if (!novoIntegranteNome.trim()) return;
    await fetch("/api/admin/integrantes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familia_id: familiaId, nome: novoIntegranteNome.trim() }),
    });
    setNovoIntegranteNome("");
    setFamiliaParaNovoIntegrante(null);
    carregar();
  }

  function exportarCSV() {
    const cabecalho = ["Família", "Nome", "Status", "Respondido em"];
    const linhas = integrantes.map((i) => {
      const familia = familias.find((f) => f.id === i.familia_id);
      return [
        familia?.nome ?? "",
        i.nome,
        i.vai_comparecer === null ? "Pendente" : i.vai_comparecer ? "Vai comparecer" : "Não vai",
        i.respondido_em ? new Date(i.respondido_em).toLocaleString("pt-BR") : "",
      ];
    });

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

  const totalPessoas = integrantes.length;
  const vao = integrantes.filter((i) => i.vai_comparecer === true).length;
  const naoVao = integrantes.filter((i) => i.vai_comparecer === false).length;
  const pendente = totalPessoas - vao - naoVao;

  const familiasFiltradas = useMemo(() => {
    if (!busca.trim()) return familias;
    return familias.filter(
      (f) =>
        f.nome.toLowerCase().includes(busca.toLowerCase()) ||
        integrantes.some(
          (i) => i.familia_id === f.id && i.nome.toLowerCase().includes(busca.toLowerCase())
        )
    );
  }, [familias, integrantes, busca]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Presença</h1>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            disabled={integrantes.length === 0}
            className="text-sm border border-slateline rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setMostrarFormFamilia(!mostrarFormFamilia)}
            className="text-sm bg-silver text-onyx font-medium rounded-lg px-4 py-2"
          >
            + Família
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-graphite border border-slateline rounded-xl p-6 text-center">
          <p className="font-display text-4xl mb-1">{totalPessoas}</p>
          <p className="text-steel text-xs uppercase tracking-wide">Total de pessoas</p>
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

      {mostrarFormFamilia && (
        <form onSubmit={adicionarFamilia} className="bg-graphite border border-slateline rounded-xl p-6 mb-6 flex gap-3">
          <input
            placeholder="Nome da família"
            value={novoNomeFamilia}
            onChange={(e) => setNovoNomeFamilia(e.target.value)}
            className="flex-1 bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={salvando}
            className="bg-silver text-onyx font-medium rounded-lg px-5 py-2 text-sm disabled:opacity-40"
          >
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => setMostrarFormFamilia(false)}
            className="border border-slateline rounded-lg px-5 py-2 text-sm"
          >
            Cancelar
          </button>
        </form>
      )}

      <input
        placeholder="Buscar por família ou pessoa..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full md:w-80 bg-onyx border border-slateline rounded-lg px-3 py-2 text-sm text-platinum placeholder:text-steel focus:outline-none mb-6"
      />

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : familiasFiltradas.length === 0 ? (
        <p className="text-steel">Nenhum resultado.</p>
      ) : (
        <div className="space-y-3">
          {familiasFiltradas.map((f) => {
            const seusIntegrantes = integrantes.filter((i) => i.familia_id === f.id);
            const aberta = expandida === f.id;
            return (
              <div key={f.id} className="bg-graphite border border-slateline rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  {editandoFamiliaId === f.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={nomeFamiliaEdicao}
                        onChange={(e) => setNomeFamiliaEdicao(e.target.value)}
                        className="bg-onyx border border-slateline rounded-lg px-2 py-1 text-sm flex-1"
                      />
                      <button onClick={() => salvarFamilia(f.id)} className="text-xs border border-slateline rounded-lg px-2.5 py-1">
                        Salvar
                      </button>
                      <button onClick={() => setEditandoFamiliaId(null)} className="text-xs border border-slateline rounded-lg px-2.5 py-1">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setExpandida(aberta ? null : f.id)}
                        className="flex items-center gap-2 text-left flex-1"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`text-steel transition-transform ${aberta ? "rotate-90" : ""}`}
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                        <span className="font-medium">{f.nome}</span>
                        <span className="text-steel text-xs">
                          ({seusIntegrantes.filter((i) => i.vai_comparecer !== null).length}/{seusIntegrantes.length})
                        </span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditandoFamiliaId(f.id);
                            setNomeFamiliaEdicao(f.nome);
                          }}
                          className="text-xs border border-slateline rounded-lg px-2.5 py-1"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmandoExclusaoFamilia(f)}
                          className="text-xs border border-red-500/50 text-red-400 rounded-lg px-2.5 py-1"
                        >
                          Apagar
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {aberta && (
                  <div className="border-t border-slateline px-4 py-3 space-y-2">
                    {seusIntegrantes.map((i) => (
                      <div key={i.id} className="flex items-center justify-between gap-2 py-1">
                        {editandoIntegranteId === i.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              value={nomeIntegranteEdicao}
                              onChange={(e) => setNomeIntegranteEdicao(e.target.value)}
                              className="bg-onyx border border-slateline rounded-lg px-2 py-1 text-sm flex-1"
                            />
                            <button onClick={() => salvarIntegrante(i.id)} className="text-xs border border-slateline rounded-lg px-2 py-1">
                              Salvar
                            </button>
                            <button onClick={() => setEditandoIntegranteId(null)} className="text-xs border border-slateline rounded-lg px-2 py-1">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-platinum">{i.nome}</span>
                            <div className="flex items-center gap-2">
                              {i.vai_comparecer === null ? (
                                <span className="text-xs px-2 py-0.5 rounded-full border border-slateline text-steel">Pendente</span>
                              ) : (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border ${
                                    i.vai_comparecer
                                      ? "border-emerald-500/40 text-emerald-400"
                                      : "border-red-500/40 text-red-400"
                                  }`}
                                >
                                  {i.vai_comparecer ? "Vai" : "Não vai"}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setEditandoIntegranteId(i.id);
                                  setNomeIntegranteEdicao(i.nome);
                                }}
                                className="text-xs border border-slateline rounded-lg px-2 py-1"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setConfirmandoExclusaoIntegrante(i)}
                                className="text-xs border border-red-500/50 text-red-400 rounded-lg px-2 py-1"
                              >
                                Apagar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {familiaParaNovoIntegrante === f.id ? (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          placeholder="Nome do novo integrante"
                          value={novoIntegranteNome}
                          onChange={(e) => setNovoIntegranteNome(e.target.value)}
                          className="bg-onyx border border-slateline rounded-lg px-2 py-1 text-sm flex-1"
                        />
                        <button
                          onClick={() => adicionarIntegrante(f.id)}
                          className="text-xs border border-slateline rounded-lg px-2 py-1"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setFamiliaParaNovoIntegrante(null)}
                          className="text-xs border border-slateline rounded-lg px-2 py-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFamiliaParaNovoIntegrante(f.id)}
                        className="text-xs text-steel pt-2"
                      >
                        + Adicionar pessoa nessa família
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmandoExclusaoFamilia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/80 backdrop-blur-sm">
          <div className="bg-graphite border border-slateline rounded-xl max-w-sm w-full p-6">
            <h3 className="font-display text-xl mb-2">Apagar família?</h3>
            <p className="text-steel text-sm mb-6">
              Isso apaga "{confirmandoExclusaoFamilia.nome}" e todos os integrantes dela. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => apagarFamilia(confirmandoExclusaoFamilia.id)}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
              >
                Apagar
              </button>
              <button
                onClick={() => setConfirmandoExclusaoFamilia(null)}
                className="flex-1 border border-slateline rounded-lg py-2 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmandoExclusaoIntegrante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-onyx/80 backdrop-blur-sm">
          <div className="bg-graphite border border-slateline rounded-xl max-w-sm w-full p-6">
            <h3 className="font-display text-xl mb-2">Apagar pessoa?</h3>
            <p className="text-steel text-sm mb-6">
              Tem certeza que quer apagar "{confirmandoExclusaoIntegrante.nome}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => apagarIntegrante(confirmandoExclusaoIntegrante.id)}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
              >
                Apagar
              </button>
              <button
                onClick={() => setConfirmandoExclusaoIntegrante(null)}
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
