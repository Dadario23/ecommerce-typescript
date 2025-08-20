import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "";
    const mode = searchParams.get("mode") || "suggest"; // 👈 Nuevo parámetro

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Construimos la búsqueda: nombre o categoría
    const filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    // Si estamos en modo "suggest" → resultados rápidos y pocos campos
    if (mode === "suggest") {
      const products = await Product.find(filter)
        .limit(5)
        .select("name slug imageUrl price")
        .lean();

      return NextResponse.json(products);
    }

    // Si estamos en modo "full" → sin límite y todos los campos
    const products = await Product.find(filter).lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error al buscar productos" },
      { status: 500 }
    );
  }
}
