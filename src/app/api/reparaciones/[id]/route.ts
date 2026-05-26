import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Reparacion, { EstadoReparacion } from "@/models/Reparacion";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    const rep = await Reparacion.findById(id).lean();
    if (!rep) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(rep);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const { estado, nota, notaInterna, notaCliente, presupuesto, cliente, equipo, fallas } = body;

    const rep = await Reparacion.findById(id);
    if (!rep) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    if (estado && estado !== rep.estado) {
      rep.historial.push({
        estado: estado as EstadoReparacion,
        fecha: new Date(),
        nota: nota || undefined,
      });
      rep.estado = estado;
    }

    if (notaInterna !== undefined) rep.notaInterna = notaInterna;
    if (notaCliente !== undefined) rep.notaCliente = notaCliente;
    if (presupuesto !== undefined) rep.presupuesto = presupuesto === "" ? undefined : Number(presupuesto);
    if (cliente) Object.assign(rep.cliente, cliente);
    if (equipo) Object.assign(rep.equipo, equipo);
    if (fallas) rep.fallas = fallas;

    await rep.save();
    return NextResponse.json(rep);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
