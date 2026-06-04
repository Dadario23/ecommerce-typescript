import { getServerSession } from "next-auth";
import { isReceptionist } from "@/lib/roles";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Presupuesto, { IPresupuesto } from "@/models/Presupuesto";
import PresupuestosClient from "./PresupuestosClient";

export const revalidate = 0;

export default async function PresupuestosPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isReceptionist(session.user?.role)) redirect("/");

  await connectDB();
  const presupuestos = await Presupuesto.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<IPresupuesto[]>();

  const serialized = presupuestos.map((p) => ({
    id: String(p._id),
    cliente: p.cliente,
    equipo: p.equipo,
    items: p.items,
    totalEstimado: p.totalEstimado,
    esGenerico: p.esGenerico,
    estado: p.estado,
    reparacionId: p.reparacionId ? String(p.reparacionId) : undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  return <PresupuestosClient presupuestos={serialized} />;
}
