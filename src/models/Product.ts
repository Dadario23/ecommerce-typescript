import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  images: string[]; // 👈 único campo de imágenes
  category: { _id: string; name: string } | string;
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

    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: "At least one image is required",
      },
    },

    category: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String },
    sku: { type: String },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ProductSchema.pre<IProduct>("validate", function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  next();
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
