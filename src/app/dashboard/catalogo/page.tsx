import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import RepairCatalog from "@/models/RepairCatalog";
import CatalogoClient from "./CatalogoClient";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") redirect("/");

  await connectDB();
  const items = await RepairCatalog.find()
    .sort({ deviceType: 1, brand: 1, model: 1 })
    .lean();

  const serialized = items.map((i: any) => ({
    _id: String(i._id),
    deviceType: i.deviceType,
    brand: i.brand,
    model: i.model,
    active: i.active,
    repairs: i.repairs ?? [],
  }));

  return <CatalogoClient items={serialized} />;
}
