"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { useToast } from "../ToastProvider";

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
  reservado_mensagem: string | null;
  reservado_em: string | null;
  ordem: number;
};

const vazio = {
  nome: "",
  descricao: "",
  imagem_url: "",
  link_compra: "",
  maps_url: "",
  onde_comprar: "",
  ordem: 0,
};

export default function PresentesPage() {
  const { showToast } = useToast();

  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);

  const [busca, setBusca] = useState("");
  const [reservadosPrimeiro, setReservadosPrimeiro] = useState(false);

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

  function iniciarEdicao(p: Presente) {
    setEditandoId(p.id);
    setMostrarForm(true);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      imagem_url: p.imagem_url ?? "",
      link_compra: p.link_compra ?? "",
      maps_url: p.maps_url ?? "",
      onde_comprar: p.onde_comprar ?? "",
      ordem: p.ordem ?? 0,
    });
  }

  function novoPresente() {
    setEditandoId(null);
    setForm(vazio);
    setMostrarForm(true);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(vazio);
    setMostrarForm(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const url = editandoId
      ? `/api/admin/presentes/${editandoId}`
      : "/api/admin/presentes";
    const method = editandoId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSalvando(false);

    if (res.ok) {
      showToast(editandoId ? "Presente atualizado" : "Presente adicionado");
      cancelarEdicao();
      carregar();
    } else {
      const data = await res.json();
      setErro(data.error || "Erro ao salvar");
      showToast("Erro ao salvar presente", "erro");
    }
  }

  async function apagar(id: string) {
    if (!confirm("Apagar este presente da lista?")) return;
    const res = await fetch(`/api/admin/presentes/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Presente apagado");
      carregar();
    } else {
      showToast("Erro ao apagar presente", "erro");
    }
  }

  async function duplicar(p: Presente) {
    const res = await fetch("/api/admin/presentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: `${p.nome} (cópia)`,
        descricao: p.descricao,
        imagem_url: p.imagem_url,
        link_compra: p.link_compra,
        maps_url: p.maps_url,
        onde_comprar: p.onde_comprar,
        ordem: p.ordem,
      }),
    });

    if (res.ok) {
      showToast("Presente duplicado");
      carregar();
    } else {
      showToast("Erro ao duplicar presente", "erro");
    }
  }

  async function desfazerReserva(id: string) {
    const res = await fetch(`/api/admin/presentes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservado: false,
        reservado_por: null,
        reservado_mensagem: null,
        reservado_em: null,
      }),
    });
    if (res.ok) {
      showToast("Reserva desfeita");
      carregar();
    } else {
      showToast("Erro ao desfazer reserva", "erro");
    }
  }

  function exportarCSV() {
    const cabecalho = ["Nome", "Status", "Reservado por", "Mensagem", "Data da reserva"];
    const linhas = presentes.map((p) => [
      p.nome,
      p.reservado ? "Reservado" : "Disponível",
      p.reservado_por ?? "",
      p.reservado_mensagem ?? "",
      p.reservado_em ? new Date(p.reservado_em).toLocaleString("pt-BR") : "",
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
    a.download = "presentes-alana-sofia.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exportado");
  }

  const listaExibida = useMemo(() => {
    let lista = presentes.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
    if (reservadosPrimeiro) {
      lista = [...lista].sort(
        (a, b) => Number(b.reservado) - Number(a.reservado)
      );
    }
    return lista;
  }, [presentes, busca, reservadosPrimeiro]);

  const bg = modoClaro ? "bg-white text-onyx" : "bg-graphite text-platinum";
  const border = modoClaro ? "border-neutral-200" : "border-slateline";
  const inputBg = modoClaro
    ? "bg-neutral-100 text-onyx border-neutral-300"
    : "bg-onyx text-platinum border-slateline";
  const rowBg = modoClaro ? "bg-white" : "bg-graphite";
  const rowAltBg = modoClaro ? "bg-neutral-50" : "bg-onyx/40";

  return (
    <div className={modoClaro ? "text-onyx" : "text-platinum"}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Presentes</h1>
        <button
          onClick={() => setModoClaro(!modoClaro)}
          className={`text-sm border rounded-lg px-3 py-1.5 ${border}`}
        >
          {modoClaro ? "Modo escuro" : "Modo claro"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          placeholder="Buscar presente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`flex-1 border rounded-lg px-3 py-2 text-sm ${inputBg}`}
        />
        <button
          onClick={() => setReservadosPrimeiro(!reservadosPrimeiro)}
          className={`text-sm border rounded-lg px-4 py-2 whitespace-nowrap ${
            reservadosPrimeiro ? "bg-silver text-onyx" : border
          }`}
        >
          Ver reservados primeiro
        </button>
        <button
          onClick={exportarCSV}
          disabled={presentes.length === 0}
          className={`text-sm border rounded-lg px-4 py-2 whitespace-nowrap disabled:opacity-40 ${border}`}
        >
          Exportar CSV
        </button>
        <button
          onClick={novoPresente}
          className="text-sm bg-silver text-onyx font-medium rounded-lg px-4 py-2 whitespace-nowrap"
        >
          + Novo presente
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className={`${bg} border ${border} rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4`}
        >
          <h2 className="md:col-span-2 font-display text-xl">
            {editandoId ? "Editar presente" : "Novo presente"}
          </h2>

          <input
            placeholder="Nome do presente"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className={`border rounded-lg px-3 py-2 text-sm ${inputBg}`}
            required
          />
          <input
            placeholder="URL da imagem"
            value={form.imagem_url}
            onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
            className={`border rounded-lg px-3 py-2 text-sm ${inputBg}`}
          />
          <input
            placeholder="Link de compra (opcional)"
            value={form.link_compra}
            onChange={(e) => setForm({ ...form, link_compra: e.target.value })}
            className={`border rounded-lg px-3 py-2 text-sm ${inputBg}`}
          />
          <input
            placeholder="Link do Google Maps (opcional)"
            value={form.maps_url}
            onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
            className={`border rounded-lg px-3 py-2 text-sm ${inputBg}`}
          />
          <input
            placeholder="Onde encontrar (loja física, ex: Loja X, Shopping Y)"
            value={form.onde_comprar}
            onChange={(e) => setForm({ ...form, onde_comprar: e.target.value })}
            className={`border rounded-lg px-3 py-2 text-sm md:col-span-2 ${inputBg}`}
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className={`border rounded-lg px-3 py-2 text-sm md:col-span-2 ${inputBg}`}
            rows={2}
          />

          {erro && <p className="md:col-span-2 text-sm text-red-500">{erro}</p>}

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="bg-silver text-onyx font-medium rounded-lg px-5 py-2 text-sm disabled:opacity-40"
            >
              {salvando ? "Salvando…" : editandoId ? "Salvar alterações" : "Adicionar presente"}
            </button>
            <button
              type="button"
              onClick={cancelarEdicao}
              className={`border rounded-lg px-5 py-2 text-sm ${border}`}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : presentes.length === 0 ? (
        <p className="text-steel">Nenhum presente cadastrado ainda.</p>
      ) : listaExibida.length === 0 ? (
        <p className="text-steel">Nenhum presente encontrado para "{busca}".</p>
      ) : (
        <div className={`${bg} border ${border} rounded-xl overflow-hidden overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left border-b ${border} text-steel uppercase text-xs`}>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">Presente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reservado por</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaExibida.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b ${border} last:border-b-0 ${
                    i % 2 === 0 ? rowBg : rowAltBg
                  }`}
                >
                  <td className="px-4 py-3 text-steel">{i + 1}</td>
                  <td className="px-4 py-3">
                    {p.imagem_url ? (
                      <img
                        src={p.imagem_url}
                        alt={p.nome}
                        className="w-10 h-10 rounded-lg object-cover border border-slateline"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-slateline bg-onyx flex items-center justify-center text-steel text-[9px]">
                        Sem foto
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {p.nome}
                    {p.reservado_mensagem && (
                      <p className="text-xs text-steel font-normal mt-0.5">
                        "{p.reservado_mensagem}"
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        p.reservado
                          ? "border-steel text-steel"
                          : "border-emerald-500/40 text-emerald-400"
                      }`}
                    >
                      {p.reservado ? "Reservado" : "Disponível"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-steel">{p.reservado_por ?? "—"}</td>
                  <td className="px-4 py-3 text-steel">
                    {p.reservado_em
                      ? new Date(p.reservado_em).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {p.reservado && (
                        <button
                          onClick={() => desfazerReserva(p.id)}
                          className={`border rounded-lg px-2.5 py-1 text-xs ${border}`}
                        >
                          Desfazer
                        </button>
                      )}
                      <button
                        onClick={() => iniciarEdicao(p)}
                        className={`border rounded-lg px-2.5 py-1 text-xs ${border}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => duplicar(p)}
                        className={`border rounded-lg px-2.5 py-1 text-xs ${border}`}
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => apagar(p.id)}
                        className="border border-red-500/50 text-red-400 rounded-lg px-2.5 py-1 text-xs"
                      >
                        Apagar
                      </button>
                    </div>
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
