import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";

export interface PublicCategory {
  _id: string;
  name: string;
  slug?: string;
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  try {
    await connectDB();
    initModels();
    const categories = await Category.find(
      { status: "published" },
      "name slug",
    ).sort({ name: 1 }).lean();
    return categories.map((c: any) => ({
      _id: String(c._id),
      name: c.name,
      slug: c.slug,
    }));
  } catch {
    return [];
  }
}
