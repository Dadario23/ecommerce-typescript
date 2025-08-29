import Image from "next/image";

interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  installment10: string;
  installment12: string;
}

export default function ProductCard({
  image,
  title,
  price,
  installment10,
  installment12,
}: ProductCardProps) {
  return (
    <div className="border rounded-lg shadow-sm p-4 flex flex-col items-center text-center bg-white">
      <div className="w-full h-40 relative">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain"
        />
      </div>
      <h3 className="mt-3 text-sm font-medium">{title}</h3>
      <p className="text-gray-700 text-sm mt-1">Oferta débito o efectivo</p>
      <p className="text-lg font-bold">{price}</p>
      <p className="text-red-600 text-sm font-semibold mt-1">
        10 cuotas sin interés {installment10}
      </p>
      <p className="text-orange-600 text-sm font-semibold">
        12 cuotas sin interés {installment12}
      </p>
    </div>
  );
}
