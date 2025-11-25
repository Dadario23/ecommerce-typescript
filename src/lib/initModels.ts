import mongoose from "mongoose";

// Importar todos los modelos
import "@/models/Category";
import "@/models/Product";

/**
 * Inicializa y verifica que todos los modelos estén registrados
 */
export function initModels() {
  const modelNames = Object.keys(mongoose.models);
  console.log("📦 Modelos registrados en Mongoose:", modelNames);

  // Verificar que los modelos esenciales estén registrados
  const requiredModels = ["Category", "Product"];
  const missingModels = requiredModels.filter(
    (model) => !modelNames.includes(model)
  );

  if (missingModels.length > 0) {
    console.error("❌ Modelos faltantes:", missingModels);
    throw new Error(`Modelos no registrados: ${missingModels.join(", ")}`);
  }

  console.log("✅ Todos los modelos registrados correctamente");
  return modelNames;
}

export default initModels;
