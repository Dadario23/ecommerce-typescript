"use client";

import { IProduct } from "@/models/Product";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductBuyActions from "@/components/product/ProductBuyActions";
import ProductShipping from "@/components/product/ProductShipping";
import ProductTabs from "@/components/product/ProductTabs";

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
