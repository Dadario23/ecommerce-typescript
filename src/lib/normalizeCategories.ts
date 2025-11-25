// src/lib/normalizeCategories.ts
export interface CategoryOption {
  _id: string;
  name: string;
}

export function normalizeCategories(categories: any[]): CategoryOption[] {
  return categories.map((cat) => ({
    _id: cat._id?.toString(),
    name:
      typeof cat.name === "string" && cat.name.trim() !== ""
        ? cat.name
        : "Sin nombre",
  }));
}
