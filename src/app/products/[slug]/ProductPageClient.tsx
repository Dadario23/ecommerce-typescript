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
    <div className="pt-20 md:pt-36 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <ProductBreadcrumb product={product} />

        {/* Main layout */}
        <div className="mt-6 flex flex-col lg:flex-row gap-10 xl:gap-14">

          {/* Left — gallery (takes remaining space) */}
          <div className="flex-1 min-w-0">
            <ProductGallery product={product} />
          </div>

          {/* Right — info panel (fixed width, sticky on desktop) */}
          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0">
            <div className="lg:sticky lg:top-36 space-y-5">
              <ProductInfo product={product} />
              <ProductBuyActions product={product} />
              <ProductShipping />
            </div>
          </div>
        </div>

        {/* Tabs: description + reviews */}
        <div className="mt-14">
          <ProductTabs product={product} />
        </div>

      </div>
    </div>
  );
}
