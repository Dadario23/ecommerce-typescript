import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ ok: true, message: "Conectado a MongoDB" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message });
  }
}
