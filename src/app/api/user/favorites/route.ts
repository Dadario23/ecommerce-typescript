import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([]);

  await connectDB();
  const user = await User.findOne({ email: session.user.email })
    .select("favorites")
    .lean<{ favorites?: string[] }>();

  return NextResponse.json(user?.favorites ?? []);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId requerido" }, { status: 400 });
    }

    await connectDB();

    // Verificar si ya está en favoritos
    const user = await User.findOne({ email: session.user.email }).select("favorites");

    if (!user) {
      console.error("[FAVORITES] Usuario no encontrado para email:", JSON.stringify(session.user.email));
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    console.log("[FAVORITES] user._id:", user._id, "email:", user.email, "favorites actuales:", user.favorites);

    const favorites: string[] = user.favorites ?? [];
    const already = favorites.includes(productId);

    const result = already
      ? await User.updateOne({ _id: user._id }, { $pull: { favorites: productId } })
      : await User.updateOne({ _id: user._id }, { $addToSet: { favorites: productId } });

    console.log("[FAVORITES] updateOne result:", result, "productId:", productId, "already:", already);

    return NextResponse.json({ added: !already, productId, debug: { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount } });
  } catch (err) {
    console.error("[FAVORITES POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
