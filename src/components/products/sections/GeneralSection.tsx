"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function GeneralSection({ product }: { product?: any }) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Product Name *</Label>
          <Input
            className="mt-1"
            name="name"
            defaultValue={product?.name}
            required
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            className="mt-1"
            name="description"
            rows={4}
            defaultValue={product?.description}
          />
        </div>
      </CardContent>
    </Card>
  );
}
