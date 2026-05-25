// Solo disponible en desarrollo
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    await connectDB();
    return NextResponse.json({ ok: true, message: "Conectado a MongoDB" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message });
  }
}
