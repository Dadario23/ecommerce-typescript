"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 max-w-lg">
          <div>
            <Label>Nombre de la tienda</Label>
            <Input placeholder="Mi Tienda Online" />
          </div>
          <div>
            <Label>Email de contacto</Label>
            <Input type="email" placeholder="soporte@mitienda.com" />
          </div>
          <div>
            <Label>Moneda</Label>
            <Input placeholder="USD" />
          </div>
          <Button>Guardar cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}
