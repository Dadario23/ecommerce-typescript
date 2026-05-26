import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Reparacion from "@/models/Reparacion";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ codigo: string }> },
) {
  try {
    const { codigo } = await params;
    await connectDB();
    const rep = await Reparacion.findOne(
      { codigo: codigo.toUpperCase() },
      { notaInterna: 0 },
    ).lean();
    if (!rep) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(rep);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
