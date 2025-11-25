import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import mongoose from "mongoose";

export async function GET() {
  try {
    // 1. Conectar a la base de datos
    await connectDB();
    console.log("✅ Conectado a MongoDB");

    // 2. Inicializar modelos
    const modelNames = initModels();

    // 3. Verificar conexión y modelos de forma más detallada
    const connectionState = mongoose.connection.readyState;
    const connectionStates = [
      "disconnected",
      "connected",
      "connecting",
      "disconnecting",
    ];

    // 4. Intentar contar documentos en cada modelo (para verificar que funcionan)
    const modelStats: any = {};

    for (const modelName of modelNames) {
      try {
        const Model = mongoose.models[modelName];
        const count = await Model.countDocuments();
        modelStats[modelName] = {
          registered: true,
          documentCount: count,
          canQuery: true,
        };
      } catch (error) {
        modelStats[modelName] = {
          registered: true,
          documentCount: 0,
          canQuery: false,
          error: (error as Error).message,
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test de modelos completado",
      database: {
        connection: connectionStates[connectionState],
        readyState: connectionState,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      models: {
        count: modelNames.length,
        names: modelNames,
        details: modelStats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error en test de modelos:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        stack:
          process.env.NODE_ENV === "development"
            ? (error as Error).stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
