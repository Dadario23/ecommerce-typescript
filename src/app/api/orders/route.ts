// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Order from "@/models/Order";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const orderData = await request.json();

    // Buscar el usuario por email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Calcular subtotal (suma de items)
    const subtotal = orderData.items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Transformar los items para que tengan productId como ObjectId
    const transformedItems = orderData.items.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.id), // ← Convertir string a ObjectId
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    // Crear la orden con los datos correctos
    const order = new Order({
      userId: user._id,
      customerEmail: session.user.email,
      items: transformedItems,
      subtotal: subtotal,
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      discount: orderData.discount || 0,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress,
      payment: {
        method: orderData.paymentMethod, // ← Usar paymentMethod del formulario
        status: "pending",
      },
      status: "pending",
    });

    await order.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: "Error creando la orden",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
