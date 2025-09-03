// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Order from "@/models/Order";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";

interface Context {
  params: { id: string };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = context.params;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la orden pertenece al usuario
    if (
      order.customerEmail !== session.user.email &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error obteniendo la orden" },
      { status: 500 }
    );
  }
}
