"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MediaSection({ product }: { product?: any }) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Thumbnail URL *</Label>
          <Input
            className="mt-1"
            name="imageUrl"
            defaultValue={product?.imageUrl}
            placeholder="https://example.com/image.jpg"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            URL de la imagen principal del producto
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium">
            Additional Images (one URL per line)
          </Label>
          <Textarea
            className="mt-1 font-mono text-sm"
            name="images"
            rows={4}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
            defaultValue={
              product?.images
                ? Array.isArray(product.images)
                  ? product.images.join("\n")
                  : String(product.images).replace(/[,\n]+/g, "\n")
                : ""
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Una URL por línea. Las URLs deben comenzar con http:// o https://
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
