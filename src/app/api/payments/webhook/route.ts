import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { Payment } from "mercadopago";
import client from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { type, data } = body;

    if (type === "payment") {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: data.id });

      const orderId = paymentData.external_reference;
      const paymentStatus = paymentData.status;

      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json(
          { error: "Orden no encontrada" },
          { status: 404 },
        );
      }

      if (paymentStatus === "approved") {
        order.payment.status = "completed";
        order.payment.transactionId = String(paymentData.id);
        order.payment.paymentDate = new Date();
        order.status = "confirmed";
      } else if (paymentStatus === "rejected") {
        order.payment.status = "failed";
        order.status = "cancelled";
      }

      await order.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en webhook MP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "webhook activo" });
}
