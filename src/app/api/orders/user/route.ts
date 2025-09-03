// app/api/orders/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Order from "@/models/Order";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    console.log("Buscando órdenes para:", session.user.email); // ← Log aquí

    // Buscar órdenes del usuario, ordenadas por fecha descendente
    const orders = await Order.find({
      customerEmail: session.user.email,
    })
      .sort({ createdAt: -1 })
      .select("orderNumber createdAt status total items")
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Error obteniendo órdenes del usuario" },
      { status: 500 }
    );
  }
}
