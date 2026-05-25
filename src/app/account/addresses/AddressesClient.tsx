"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, MapPin, Star } from "lucide-react";

interface Address {
  _id?: string;
  title: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM: Address = {
  title: "", firstName: "", lastName: "", street: "",
  city: "", state: "", zipCode: "", country: "Argentina",
  phone: "", isDefault: false,
};

const AR_PROVINCES = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba",
  "Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago del Estero",
  "Tierra del Fuego","Tucumán",
];

export default function AddressesClient() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Address>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) loadAddresses();
  }, [session]);

  const loadAddresses = async () => {
    setIsLoading(true);
    fetch("/api/user/addresses")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAddresses(Array.isArray(d) ? d : []))
      .catch(() => setAddresses([]))
      .finally(() => setIsLoading(false));
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      firstName: session?.user?.name?.split(" ")[0] || "",
      lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr._id ?? null);
    setFormData({ ...addr });
    setIsDialogOpen(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/user/addresses/${editingId}` : "/api/user/addresses";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await loadAddresses();
        setIsDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    loadAddresses();
  };

  const setAsDefault = async (id: string) => {
    await fetch(`/api/user/addresses/${id}/default`, { method: "PUT" });
    loadAddresses();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Mis direcciones</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 bg-[#1E3A8A] text-white text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar dirección" : "Nueva dirección"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Nombre de la dirección *
                  </Label>
                  <Input name="title" value={formData.title} onChange={handleInput}
                    placeholder="Casa, Trabajo..." required className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Nombre *</Label>
                  <Input name="firstName" value={formData.firstName} onChange={handleInput}
                    required className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Apellido *</Label>
                  <Input name="lastName" value={formData.lastName} onChange={handleInput}
                    required className="rounded-lg" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Dirección *</Label>
                  <Input name="street" value={formData.street} onChange={handleInput}
                    placeholder="Calle, número, depto" required className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Ciudad *</Label>
                  <Input name="city" value={formData.city} onChange={handleInput}
                    required className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Provincia *</Label>
                  <Select value={formData.state}
                    onValueChange={(v: string) => setFormData((p) => ({ ...p, state: v }))}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Seleccioná" />
                    </SelectTrigger>
                    <SelectContent>
                      {AR_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Cód. Postal *</Label>
                  <Input name="zipCode" value={formData.zipCode} onChange={handleInput}
                    required className="rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Teléfono</Label>
                  <Input name="phone" type="tel" value={formData.phone} onChange={handleInput}
                    placeholder="+54 11..." className="rounded-lg" />
                </div>
                <div className="col-span-2 flex items-center gap-2.5 pt-1">
                  <Checkbox
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(c: boolean | "indeterminate") =>
                      setFormData((p) => ({ ...p, isDefault: c === true }))
                    }
                  />
                  <Label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer select-none">
                    Usar como dirección principal
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#1E3A8A] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-70">
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Sin direcciones guardadas</p>
          <p className="text-sm text-gray-400 mb-5">
            Guardá tus direcciones para agilizar el checkout
          </p>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-[#1E3A8A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar dirección
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="relative border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors"
            >
              {addr.isDefault && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-blue-500" />
                  Principal
                </span>
              )}

              <div className="flex items-start gap-2.5 mb-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-gray-800">{addr.title}</p>
                  <p className="text-xs text-gray-500">
                    {addr.firstName} {addr.lastName}
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-0.5 mb-4">
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                {addr.phone && <p>{addr.phone}</p>}
              </div>

              <div className="flex items-center gap-1 border-t border-gray-50 pt-3">
                <button onClick={() => openEdit(addr)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1E3A8A] font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button onClick={() => addr._id && handleDelete(addr._id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
                {!addr.isDefault && (
                  <button onClick={() => addr._id && setAsDefault(addr._id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors ml-auto">
                    <Star className="w-3.5 h-3.5" />
                    Hacer principal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
