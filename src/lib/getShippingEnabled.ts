import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function getShippingEnabled(): Promise<boolean> {
  await connectDB();
  const doc = await Setting.findOne({}, "shippingEnabled").lean<{ shippingEnabled?: boolean }>();
  return doc?.shippingEnabled ?? true;
}
