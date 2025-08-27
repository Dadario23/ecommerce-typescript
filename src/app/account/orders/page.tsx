// app/account/orders/page.tsx
export default function OrdersPage() {
  // Datos de ejemplo - reemplazar con datos reales
  const orders = [
    {
      id: "ORD-12345",
      date: "2023-10-15",
      status: "Entregado",
      total: "$125,999",
      items: 3,
    },
    {
      id: "ORD-12346",
      date: "2023-10-10",
      status: "En camino",
      total: "$89,500",
      items: 2,
    },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Historial de pedidos</h3>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tienes pedidos realizados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">Pedido #{order.id}</h3>
                  <p className="text-sm text-gray-500">Fecha: {order.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === "Entregado"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm">{order.items} producto(s)</p>
                  <p className="text-lg font-bold">{order.total}</p>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
