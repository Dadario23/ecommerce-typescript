import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ShippingConfig from "@/models/ShippingConfig";

const DEFAULT_ZONES = [
  {
    id: "caba",
    name: "CABA",
    localities: ["Buenos Aires","Ciudad Autónoma de Buenos Aires","CABA","Palermo","Belgrano","Caballito","Flores","Villa Urquiza","Almagro","Balvanera","San Telmo","La Boca","Recoleta","Barracas","Villa del Parque","Mataderos","Liniers","Parque Patricios"],
    flex: 3200,
    standard: 2500,
  },
  {
    id: "gba1",
    name: "GBA 1",
    localities: ["Lomas de Zamora","Lanús","Avellaneda","Morón","Ituzaingó","Hurlingham","Tres de Febrero","San Martín","San Isidro","Vicente López","San Fernando","Haedo","Ramos Mejía","San Justo","Ciudadela","Castelar","El Palomar","Martínez","Olivos","Florida","Munro","Villa Adelina","Boulogne"],
    flex: 4500,
    standard: 3800,
  },
  {
    id: "gba2",
    name: "GBA 2",
    localities: ["Quilmes","Almirante Brown","Florencio Varela","Berazategui","Tigre","San Miguel","Malvinas Argentinas","José C. Paz","Moreno","Merlo","La Matanza","Ezeiza","Esteban Echeverría","Don Torcuato","General Pacheco","Temperley","Adrogué","Longchamps","Monte Grande","Villa Domínico","Wilde","Bernal","Quilmes Oeste"],
    flex: 5300,
    standard: 4600,
  },
  {
    id: "gba3",
    name: "GBA 3",
    localities: ["La Plata","Guernica","Cañuelas","Marcos Paz","General Rodríguez","Pilar","Escobar","Berisso","Ensenada","City Bell","Gonnet","Ringuelet","Manuel B. Gonnet","Del Viso","Maquinista Savio","Garín","Campana","Zárate"],
    flex: 5800,
    standard: 5100,
  },
];

// GET — público: devuelve zonas y tarifas
export async function GET() {
  try {
    await connectDB();
    const config = await ShippingConfig.findOne().lean();

    // Si no existe aún, lo crea con los valores por defecto
    if (!config) {
      const created = await ShippingConfig.create({ zones: DEFAULT_ZONES });
      return NextResponse.json(created.zones);
    }

    return NextResponse.json(config.zones);
  } catch (error) {
    console.error("[SHIPPING_GET]", error);
    return NextResponse.json({ error: "Error obteniendo tarifas" }, { status: 500 });
  }
}

// PUT — admin: actualiza tarifas
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { zones } = await req.json();
    if (!Array.isArray(zones)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    await connectDB();
    const config = await ShippingConfig.findOneAndUpdate(
      {},
      { zones },
      { new: true, upsert: true },
    );

    return NextResponse.json(config.zones);
  } catch (error) {
    console.error("[SHIPPING_PUT]", error);
    return NextResponse.json({ error: "Error actualizando tarifas" }, { status: 500 });
  }
}
