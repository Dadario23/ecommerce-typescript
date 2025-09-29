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
            required
          />
        </div>
        <div>
          <Label className="text-sm font-medium">
            Additional Images (comma separated)
          </Label>
          <Textarea
            className="mt-1"
            name="images"
            rows={2}
            defaultValue={product?.images?.join(", ")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
