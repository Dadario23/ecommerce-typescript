// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // ← Ruta corregida
import Cart from "@/models/Cart";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Buscar el carrito del usuario en MongoDB
    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      // Si no existe, crear uno vacío
      const newCart = new Cart({
        userId: session.user.id,
        items: [],
      });
      await newCart.save();
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    return NextResponse.json({ items: cart.items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { items } = await request.json();

    // Validar los items del carrito
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Formato de items inválido" },
        { status: 400 }
      );
    }

    // Actualizar o crear el carrito del usuario
    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      {
        items: items,
        $setOnInsert: { userId: session.user.id },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return NextResponse.json({ success: true, items: cart.items });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Vaciar el carrito del usuario
    await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { items: [] },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
