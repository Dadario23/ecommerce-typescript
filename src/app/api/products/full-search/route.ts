import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Buscar tanto en nombre como en categoría
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("[FULL_SEARCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error al buscar productos" },
      { status: 500 }
    );
  }
}
