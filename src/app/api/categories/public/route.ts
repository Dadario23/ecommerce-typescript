import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();
    initModels();

    // Solo categorías publicadas, con campos básicos
    const categories = await Category.find(
      { status: "published" },
      "name slug description thumbnail",
    ).sort({ name: 1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching public categories:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 },
    );
  }
}
