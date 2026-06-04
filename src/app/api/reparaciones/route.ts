import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Reparacion from "@/models/Reparacion";
import User from "@/models/User";
import { isReceptionist, isStaff } from "@/lib/roles";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaff(session?.user?.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await connectDB();

  const filter =
    session!.user.role === "technician"
      ? { assignedTo: session!.user.id }
      : {};

  const reparaciones = await Reparacion.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(reparaciones);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isReceptionist(session?.user?.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  await connectDB();
  const data = await request.json();

  if (data.cliente?.email) {
    const user = await User.findOne({ email: data.cliente.email }).lean<{ _id: unknown }>();
    if (user) data.userId = user._id;
  }

  const rep = new Reparacion(data);
  await rep.save();
  return NextResponse.json(rep, { status: 201 });
}
