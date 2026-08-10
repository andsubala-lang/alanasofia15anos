"use client";

import { useEffect, useState, FormEvent } from "react";

type Presente = {
  id: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  link_compra: string | null;
  maps_url: string | null;
  reservado: boolean;
  reservado_por: string | null;
  reservado_mensagem: string | null;
  ordem: number;
};

const vazio = {
  nome: "",
  descricao: "",
  imagem_url: "",
  link_compra: "",
  maps_url: "",
  ordem: 0,
};

export default function AdminDashboard() {
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modoClaro, setModoClaro] = useState(false);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

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
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      imagem_url: p.imagem_url ?? "",
      link_compra: p.link_compra ?? "",
      maps_url: p.maps_url ?? "",
      ordem: p.ordem ?? 0,
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setForm(vazio);
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
      cancelarEdicao();
      carregar();
    } else {
      const data = await res.json();
      setErro(data.error || "Erro ao salvar");
    }
  }

  async function apagar(id: string) {
    if (!confirm("Apagar este presente da lista?")) return;
    await fetch(`/api/admin/presentes/${id}`, { method: "DELETE" });
    carregar();
  }

  async function desfazerReserva(id: string) {
    await fetch(`/api/admin/presentes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservado: false,
        reservado_por: null,
        reservado_mensagem: null,
        reservado_em: null,
      }),
    });
    carregar();
  }

  const bg = modoClaro ? "bg-white text-onyx" : "bg-graphite text-platinum";
  const border = modoClaro ? "border-neutral-200" : "border-slateline";
  const inputBg = modoClaro
    ? "bg-neutral-100 text-onyx border-neutral-300"
    : "bg-onyx text-platinum border-slateline";

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

      <form
        onSubmit={handleSubmit}
        className={`${bg} border ${border} rounded-xl p-6 mb-10 grid grid-cols-1 md:grid-cols-2 gap-4`}
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
          {editandoId && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className={`border rounded-lg px-5 py-2 text-sm ${border}`}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {carregando ? (
        <p className="text-steel">Carregando…</p>
      ) : presentes.length === 0 ? (
        <p className="text-steel">Nenhum presente cadastrado ainda.</p>
      ) : (
        <div className="space-y-3">
          {presentes.map((p) => (
            <div
              key={p.id}
              className={`${bg} border ${border} rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4`}
            >
              <div className="flex-1">
                <p className="font-medium">{p.nome}</p>
                {p.reservado ? (
                  <p className="text-sm text-steel">
                    Reservado por {p.reservado_por}
                    {p.reservado_mensagem ? ` — "${p.reservado_mensagem}"` : ""}
                  </p>
                ) : (
                  <p className="text-sm text-steel">Disponível</p>
                )}
              </div>
              <div className="flex gap-2 text-sm">
                {p.reservado && (
                  <button
                    onClick={() => desfazerReserva(p.id)}
                    className={`border rounded-lg px-3 py-1.5 ${border}`}
                  >
                    Desfazer reserva
                  </button>
                )}
                <button
                  onClick={() => iniciarEdicao(p)}
                  className={`border rounded-lg px-3 py-1.5 ${border}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => apagar(p.id)}
                  className="border border-red-500/50 text-red-400 rounded-lg px-3 py-1.5"
                >
                  Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
