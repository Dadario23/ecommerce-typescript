export default function FiltersSidebar() {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-4">Filtrar</h2>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Oferta</h3>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Ofertas del mes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> 35% de descuento
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Marca</h3>
        <div className="flex flex-col gap-1">
          {["Samsung", "Motorola", "Sony", "LG"].map((brand) => (
            <label key={brand} className="flex items-center gap-2">
              <input type="checkbox" /> {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Memoria RAM</h3>
        <div className="flex flex-col gap-1">
          {["2GB", "4GB", "8GB", "16GB"].map((ram) => (
            <label key={ram} className="flex items-center gap-2">
              <input type="checkbox" /> {ram}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
