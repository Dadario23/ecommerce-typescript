import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Reparacion from "@/models/Reparacion";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    await connectDB();
    const reparaciones = await Reparacion.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(reparaciones);
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    await connectDB();
    const data = await request.json();

    // Auto-link to user account if email provided
    if (data.cliente?.email) {
      const user = await User.findOne({ email: data.cliente.email }).lean<{ _id: unknown }>();
      if (user) data.userId = user._id;
    }

    const rep = new Reparacion(data);
    await rep.save();
    return NextResponse.json(rep, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
