// src/models/Category.ts
import { Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    template: { type: String, default: "default" },

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },

    // Imagen
    thumbnail: { type: String }, // URL a Cloudinary / S3
  },
  { timestamps: true }
);

const Category = models.Category || model("Category", categorySchema);

export default Category;
