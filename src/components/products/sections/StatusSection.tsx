"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function StatusSection({ product }: { product?: any }) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Status</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Switch name="isActive" defaultChecked={product?.isActive} />
        <span className="text-sm">Published</span>
      </CardContent>
    </Card>
  );
}
