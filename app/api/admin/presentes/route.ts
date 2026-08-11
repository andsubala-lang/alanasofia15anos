import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function autenticado(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!autenticado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("alana_presentes")
    .select("*")
    .order("ordem", { ascending: true })
    .order("criado_em", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ presentes: data });
}

export async function POST(request: NextRequest) {
  if (!autenticado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("alana_presentes")
    .insert({
      nome: body.nome,
      descricao: body.descricao || null,
      imagem_url: body.imagem_url || null,
      link_compra: body.link_compra || null,
      maps_url: body.maps_url || null,
      onde_comprar: body.onde_comprar || null,
      ordem: body.ordem ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ presente: data });
}
