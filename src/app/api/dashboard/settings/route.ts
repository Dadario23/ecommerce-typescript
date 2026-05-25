import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

async function getSettings() {
  await connectDB();
  const doc = await Setting.findOne().lean<{
    storeName: string; storeEmail: string; storePhone: string;
    storeDescription: string; shippingCost: number;
    freeShippingThreshold: number; instagramUrl: string;
    facebookUrl: string; whatsappNumber: string;
  }>();
  if (!doc) {
    const created = await Setting.create({});
    return (await Setting.findById(created._id).lean()) as typeof doc;
  }
  return doc;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const allowed = [
    "storeName", "storeEmail", "storePhone", "storeDescription",
    "shippingCost", "freeShippingThreshold",
    "instagramUrl", "facebookUrl", "whatsappNumber",
    "carouselImages",
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  await connectDB();
  const doc = await Setting.findOneAndUpdate(
    {},
    { $set: update },
    { new: true, upsert: true, lean: true, strict: false },
  );
  return NextResponse.json(doc);
}
