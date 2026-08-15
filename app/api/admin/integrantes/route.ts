import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function autenticado(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!autenticado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("alana_integrantes")
    .insert({ familia_id: body.familia_id, nome: body.nome })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integrante: data });
}
