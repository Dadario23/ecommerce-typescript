import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import SettingsClient from "./SettingsClient";

export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") redirect("/");

  await connectDB();
  let doc = await Setting.findOne().lean<{
    storeName: string; storeEmail: string; storePhone: string;
    storeDescription: string; shippingCost: number;
    freeShippingThreshold: number; instagramUrl: string;
    facebookUrl: string; whatsappNumber: string;
    homeFeaturedMode?: "products" | "categories";
    shippingEnabled?: boolean;
  }>();
  if (!doc) {
    const created = await Setting.create({});
    doc = await Setting.findById(created._id).lean() as typeof doc;
  }

  const settings = {
    storeName:             doc?.storeName ?? "Compumobile",
    storeEmail:            doc?.storeEmail ?? "",
    storePhone:            doc?.storePhone ?? "",
    storeDescription:      doc?.storeDescription ?? "",
    shippingCost:          doc?.shippingCost ?? 0,
    freeShippingThreshold: doc?.freeShippingThreshold ?? 0,
    instagramUrl:          doc?.instagramUrl ?? "",
    facebookUrl:           doc?.facebookUrl ?? "",
    whatsappNumber:        doc?.whatsappNumber ?? "",
    homeFeaturedMode:      doc?.homeFeaturedMode ?? "products",
    shippingEnabled:       doc?.shippingEnabled ?? true,
  };

  return (
    <SettingsClient
      initialSettings={settings}
      adminName={session.user?.name ?? ""}
      adminEmail={session.user?.email ?? ""}
    />
  );
}
