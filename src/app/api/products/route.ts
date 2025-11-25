import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { initModels } from "@/lib/initModels";

// GET: listar productos con filtros
export async function GET(request: Request) {
  try {
    // 1. Conectar a la base de datos
    await connectDB();

    // 2. INICIALIZAR MODELOS - ESTO ES CLAVE
    initModels();

    // 3. Construir query
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");

    let query = {};
    if (categorySlug) {
      query = { category: categorySlug };
    }

    // 4. Ejecutar consulta con populate
    const products = await Product.find(query)
      .populate("category", "name") // 👈 Ahora debería funcionar
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      {
        error: "Error al obtener productos",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST: crear producto
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Nombre y precio son obligatorios" },
        { status: 400 }
      );
    }

    // 👇 forzamos que category se guarde como ObjectId
    if (body.category) {
      body.category = new mongoose.Types.ObjectId(body.category);
    }

    const product = await Product.create(body);
    const populated = await product.populate("category", "name");

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
