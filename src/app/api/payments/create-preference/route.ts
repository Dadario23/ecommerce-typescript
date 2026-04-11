import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Preference } from "mercadopago";
import client from "@/lib/mercadopago";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const orderData = await request.json();

    // Buscar usuario
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Calcular subtotal
    const subtotal = orderData.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    // Transformar items
    const transformedItems = orderData.items.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.id),
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    // Crear orden en DB con estado pending
    const order = new Order({
      userId: user._id,
      customerEmail: session.user.email,
      items: transformedItems,
      subtotal,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: orderData.total,
      shippingAddress: orderData.shippingAddress,
      payment: {
        method: "mercadopago",
        status: "pending",
      },
      status: "pending",
    });

    await order.save();

    // Crear preferencia en Mercado Pago
    const preference = new Preference(client);

    const mpItems = orderData.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: "ARS",
    }));

    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const isProd = process.env.NODE_ENV === "production";

    const response = await preference.create({
      body: {
        items: mpItems,
        external_reference: order._id.toString(),
        back_urls: {
          success: `${baseUrl}/order-success?orderId=${order._id}`,
          failure: `${baseUrl}/checkout?error=pago_fallido`,
          pending: `${baseUrl}/order-success?orderId=${order._id}`,
        },
        ...(isProd && { auto_return: "approved" }),
        notification_url: `${baseUrl}/api/payments/webhook`,
      },
    });

    return NextResponse.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      orderId: order._id,
    });
  } catch (error: any) {
    console.error("Error creando preferencia MP:", error);
    return NextResponse.json(
      { error: "Error creando preferencia", details: error.message },
      { status: 500 },
    );
  }
}
