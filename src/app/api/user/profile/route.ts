import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("name email phone");
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json({ name: user.name ?? "", email: user.email, phone: user.phone ?? "" });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { name, phone } = await req.json();
  const update: Record<string, string> = {};
  if (typeof name === "string" && name.trim()) update.name = name.trim();
  if (typeof phone === "string") update.phone = phone.trim();

  await connectDB();
  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: update },
    { new: true, select: "name email phone" },
  );
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  return NextResponse.json({ name: user.name ?? "", email: user.email, phone: user.phone ?? "" });
}
