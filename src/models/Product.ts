import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number; // precio tachado opcional
  description: string;
  imageUrl: string; // imagen principal
  images?: string[]; // galería opcional
  category: string;
  brand?: string;
  sku?: string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // para URL amigable
    price: { type: Number, required: true },
    compareAtPrice: { type: Number }, // precio tachado (ej. 999 antes 799)
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    images: [{ type: String }], // lista de imágenes
    category: { type: String, required: true },
    brand: { type: String },
    sku: { type: String },
  },
  { timestamps: true }
);

// Middleware para generar slug automáticamente desde el nombre
ProductSchema.pre<IProduct>("validate", function (next) {
  // Siempre regenerar slug a partir del name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  next();
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
