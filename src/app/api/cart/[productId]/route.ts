import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Cart from "@/models/Cart";
import { connectDB } from "@/lib/mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { productId } = params;

    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { $pull: { items: { id: productId } } }, // 👈 elimina solo ese producto
      { new: true }
    );

    return NextResponse.json({
      success: true,
      items: cart?.items || [],
    });
  } catch (error) {
    console.error("[API CART] Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
