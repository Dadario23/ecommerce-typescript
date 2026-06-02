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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId)
    return NextResponse.json({ error: "productId requerido" }, { status: 400 });

  await connectDB();

  // Verificar si ya está en favoritos
  const existing = await User.findOne({
    email: session.user.email,
    favorites: productId,
  }).select("_id").lean();

  const already = !!existing;

  await User.updateOne(
    { email: session.user.email },
    already
      ? { $pull: { favorites: productId } }
      : { $addToSet: { favorites: productId } }
  );

  return NextResponse.json({ added: !already });
}
