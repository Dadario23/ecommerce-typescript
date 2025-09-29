"use client";

import { IProduct } from "@/models/Product";
import ProductBreadcrumb from "@/components/products/ProductBreadcrumb";
import ProductGallery from "@/components/products/ProductGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductBuyActions from "@/components/products/ProductBuyActions";
import ProductShipping from "@/components/products/ProductShipping";
import ProductTabs from "@/components/products/ProductTabs";

export default function ProductPageClient({ product }: { product: IProduct }) {
  return (
    <div className="pt-[140px] pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <ProductBreadcrumb product={product} />
        <div className="flex flex-col md:flex-row gap-8">
          <ProductGallery product={product} />
          <div className="flex-1">
            <ProductInfo product={product} />
            <ProductBuyActions product={product} />
            <ProductShipping />
          </div>
        </div>
        <ProductTabs product={product} />
      </div>
    </div>
  );
}
