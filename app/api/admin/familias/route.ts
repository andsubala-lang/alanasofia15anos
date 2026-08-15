import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function autenticado(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!autenticado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: familias, error: erroFamilias } = await supabaseAdmin
    .from("alana_familias")
    .select("*")
    .order("nome", { ascending: true });

  if (erroFamilias) return NextResponse.json({ error: erroFamilias.message }, { status: 500 });

  const { data: integrantes, error: erroIntegrantes } = await supabaseAdmin
    .from("alana_integrantes")
    .select("*")
    .order("criado_em", { ascending: true });

  if (erroIntegrantes) return NextResponse.json({ error: erroIntegrantes.message }, { status: 500 });

  return NextResponse.json({ familias, integrantes });
}

export async function POST(request: NextRequest) {
  if (!autenticado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const { data: familia, error: erroFamilia } = await supabaseAdmin
    .from("alana_familias")
    .insert({ nome: body.nome })
    .select()
    .single();

  if (erroFamilia) return NextResponse.json({ error: erroFamilia.message }, { status: 500 });

  const nomesIntegrantes: string[] = body.integrantes ?? [];
  if (nomesIntegrantes.length > 0) {
    const { error: erroIntegrantes } = await supabaseAdmin
      .from("alana_integrantes")
      .insert(nomesIntegrantes.map((nome) => ({ familia_id: familia.id, nome })));

    if (erroIntegrantes) return NextResponse.json({ error: erroIntegrantes.message }, { status: 500 });
  }

  return NextResponse.json({ familia });
}
