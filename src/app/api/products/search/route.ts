import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query") || "";
    const mode = searchParams.get("mode") || "suggest"; // 👈 Nuevo parámetro
    // 1️⃣ Buscar categorías cuyo nombre coincida con el query
    const matchedCategories = await Category.find({
      name: { $regex: query, $options: "i" },
    })
      .select("_id")
      .lean();

    // 2️⃣ Extraer solo los IDs
    const categoryIds = matchedCategories.map((cat) => cat._id);

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
      ],
    };

    // Si estamos en modo "suggest" → resultados rápidos y pocos campos
    if (mode === "suggest") {
      const products = await Product.find(filter)
        .limit(5)
        .select("name slug images price")
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
      { status: 500 },
    );
  }
}
