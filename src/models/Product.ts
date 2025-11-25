// src/models/Product.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  imageUrl: string;
  images?: string[];
  category: { _id: string; name: string } | string; // ✅ flexible
  brand?: string;
  stock?: number;
  sku?: string;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: false },
    brand: { type: String },
    sku: { type: String },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Middleware para generar slug automáticamente desde el name
ProductSchema.pre<IProduct>("validate", function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  next();
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
