import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Presupuesto from "@/models/Presupuesto";

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
    const pres = await Presupuesto.findById(id).lean();
    if (!pres) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(pres);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PATCH(
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
    const pres = await Presupuesto.findByIdAndUpdate(id, body, { new: true });
    if (!pres) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(pres);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
