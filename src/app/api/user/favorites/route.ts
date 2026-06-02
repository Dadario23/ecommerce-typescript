import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// GET — devuelve los IDs de productos favoritos del usuario
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 200 });
  }
  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("favorites").lean<{ favorites: string[] }>();
  return NextResponse.json(user?.favorites ?? []);
}

// POST — agrega o quita un favorito (toggle)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).select("favorites");
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const already = user.favorites.includes(productId);
  if (already) {
    user.favorites = user.favorites.filter((id: string) => id !== productId);
  } else {
    user.favorites.push(productId);
  }
  await user.save();

  return NextResponse.json({ favorites: user.favorites, added: !already });
}
