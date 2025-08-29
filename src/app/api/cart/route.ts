import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Cart from "@/models/Cart";
import { connectDB } from "@/lib/mongodb";

// 🔹 Helper para asegurarnos de que siempre devolvemos array
const normalizeItems = (items: any) => {
  if (!items) return [];
  if (!Array.isArray(items)) {
    console.warn("[API CART] Formato inesperado en items:", items);
    return [];
  }
  return items;
};

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    console.log("\n=== [API CART - GET] ===");
    console.log("Usuario autenticado:", !!session);
    console.log("Usuario ID:", session?.user?.id || "anon");

    if (!session || !session.user) {
      console.log("Carrito anónimo → []");
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Buscar carrito
    let cart = await Cart.findOne({ userId: session.user.id });
    console.log("Carrito encontrado en DB:", cart ? "✅ Sí" : "❌ No");

    // Si no existe, lo creamos vacío
    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [] });
      await cart.save();
      console.log("Carrito creado vacío.");
    }

    const safeItems = normalizeItems(cart.items);
    console.log("Items a devolver:", safeItems);

    return NextResponse.json({ items: safeItems }, { status: 200 });
  } catch (error) {
    console.error("[API CART] Error en GET:", error);
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

    console.log("\n=== [API CART - POST] ===");
    console.log("Usuario autenticado:", !!session);
    console.log("Usuario ID:", session?.user?.id || "anon");

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body || {};

    console.log("Items recibidos para guardar:", items);

    if (!Array.isArray(items)) {
      console.warn("[API CART] Formato inválido de items:", items);
      return NextResponse.json(
        { error: "Formato de items inválido" },
        { status: 400 }
      );
    }

    // Guardar o actualizar carrito del usuario
    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      {
        items,
        $setOnInsert: { userId: session.user.id },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    console.log("Carrito actualizado:", cart.items);

    return NextResponse.json({ success: true, items: cart.items });
  } catch (error) {
    console.error("[API CART] Error en POST:", error);
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

    console.log("\n=== [API CART - DELETE] ===");
    console.log("Usuario autenticado:", !!session);
    console.log("Usuario ID:", session?.user?.id || "anon");

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Vaciar carrito en la DB
    await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { items: [] },
      { new: true }
    );

    console.log("Carrito vaciado con éxito.");

    // 🔹 Flag reset para frontend
    return NextResponse.json({
      success: true,
      reset: true,
      items: [],
    });
  } catch (error) {
    console.error("[API CART] Error en DELETE:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
