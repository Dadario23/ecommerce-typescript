import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Reparacion, { ESTADO_LABEL, ESTADO_COLOR, IReparacion } from "@/models/Reparacion";
import Link from "next/link";
import { Plus, Wrench } from "lucide-react";

export const revalidate = 0;

const EQUIPO_ICON: Record<string, string> = {
  celular: "📱",
  laptop: "💻",
  pc: "🖥️",
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ReparacionesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") redirect("/");

  await connectDB();
  const reparaciones = await Reparacion.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<IReparacion[]>();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reparaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reparaciones.length} {reparaciones.length === 1 ? "orden" : "órdenes"} registradas
          </p>
        </div>
        <Link
          href="/dashboard/reparaciones/nueva"
          className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva reparación
        </Link>
      </div>

      {reparaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay reparaciones registradas</p>
          <p className="text-sm text-gray-400 mt-1">
            Creá la primera orden desde el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reparaciones.map((r) => (
                  <tr key={String(r._id)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#1E3A8A] text-sm">
                        {r.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.cliente.nombre}</p>
                      <p className="text-xs text-gray-400">{r.cliente.telefono}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-base mr-1.5">
                        {EQUIPO_ICON[r.equipo.tipo] ?? "🔧"}
                      </span>
                      <span className="text-gray-700">
                        {r.equipo.marca} {r.equipo.modelo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_COLOR[r.estado]}`}
                      >
                        {ESTADO_LABEL[r.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {fmtDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/reparaciones/${String(r._id)}`}
                        className="text-xs font-medium text-[#1E3A8A] hover:underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
