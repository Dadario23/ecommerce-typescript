// src/app/api/fix-slugs/route.ts — solo disponible en desarrollo
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    await connectDB();

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      if (!product.slug || product.slug === "undefined") {
        const slug = product.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        await Product.updateOne({ _id: product._id }, { $set: { slug } });
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: "Slugs actualizados correctamente ✅",
      updated: updatedCount,
    });
  } catch (error) {
    console.error("❌ Error en fix-slugs:", error);
    return NextResponse.json(
      { message: "Error al actualizar slugs" },
      { status: 500 }
    );
  }
}
