import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ShippingConfig from "@/models/ShippingConfig";

interface IpApiResponse {
  status: string;
  city?: string;
  regionName?: string;
}

function normalizeLocality(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function matchZone(city: string, zones: { id: string; name: string; localities: string[]; flex: number; standard: number }[]) {
  const normalized = normalizeLocality(city);
  return zones.find((z) =>
    z.localities.some((l) => normalizeLocality(l) === normalized),
  ) ?? null;
}

async function detectZoneByIp(ip: string, zones: { id: string; name: string; localities: string[]; flex: number; standard: number }[]) {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.")) {
    return null; // localhost / LAN — no detectar
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName&lang=es`, {
      next: { revalidate: 0 },
    });
    const data: IpApiResponse = await res.json();
    if (data.status !== "success" || !data.city) return null;
    return matchZone(data.city, zones);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const configDoc = await ShippingConfig.findOne().lean();
    const zones = configDoc?.zones ?? [];

    const session = await getServerSession(authOptions);

    // 1. Usuario logueado → usar dirección del perfil
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email })
        .select("addresses")
        .lean<{ addresses: { city: string; isDefault: boolean }[] }>();

      const addresses = user?.addresses ?? [];
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

      if (defaultAddr?.city) {
        const zone = matchZone(defaultAddr.city, zones);
        if (zone) {
          return NextResponse.json({ zone, source: "profile" });
        }
      }

      // Tiene sesión pero no dirección válida → pedir que confirme
      return NextResponse.json({ zone: null, source: "no-address" });
    }

    // 2. No logueado → intentar por IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const zone = await detectZoneByIp(ip, zones);

    return NextResponse.json({ zone, source: zone ? "ip" : "unknown" });
  } catch (error) {
    console.error("[MY_ZONE]", error);
    return NextResponse.json({ zone: null, source: "error" });
  }
}
