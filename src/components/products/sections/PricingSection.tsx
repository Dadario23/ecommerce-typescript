"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PricingSection({ product }: { product?: any }) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Base Price *</Label>
          <Input
            className="mt-1"
            type="number"
            step="0.01"
            name="price"
            defaultValue={product?.price}
            required
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Compare at Price</Label>
          <Input
            className="mt-1"
            type="number"
            step="0.01"
            name="compareAtPrice"
            defaultValue={product?.compareAtPrice}
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Discount Type</Label>
          <div className="flex gap-4 mt-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="discountType"
                value="none"
                defaultChecked
              />
              No Discount
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="discountType" value="percentage" />
              Percentage %
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="discountType" value="fixed" />
              Fixed Price
            </label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Discount Percentage</Label>
          <Input
            className="mt-1"
            type="number"
            step="1"
            name="discountPercentage"
            placeholder="10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
