// src/types/product.ts
export interface Product {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  category: string;
  brand?: string;
  imageUrl: string;
  isActive?: boolean;
  rating?: number;
  createdAt?: string;
}

// src/types/sort.ts
export interface SortConfig {
  key: keyof Product;
  direction: "asc" | "desc";
}
