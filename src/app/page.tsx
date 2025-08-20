import BenefitsBar from "@/components/BenefitsBar";
import Carousel from "@/components/Carousel";
import CatalogBanner from "@/components/home/CatalogBanner";
import HomeProductsSection from "@/components/home/HomeProductsSection";
import Link from "next/link";

const categories = [
  {
    name: "TV - Video - Foto",
    image:
      "https://de2kqc9pq55cj.cloudfront.net/fit-in/700x700/filters:fill(FFFFFF):quality(90):format(webp)/_img_productos/smart-tv-xion-40-xi-led40smart-foto1.jpg",
  },
  {
    name: "Celulares",
    image: "https://m.media-amazon.com/images/I/510T1rLLZGL._AC_SL1000_.jpg",
  },
  {
    name: "Informática",
    image:
      "https://acdn-us.mitiendanube.com/stores/003/998/438/products/-80f435231f1866e4f317092992919117-1024-1024.webp",
  },
  {
    name: "Gaming",
    image:
      "https://www.pngall.com/wp-content/uploads/5/PlayStation-5-PNG-Free-Download.png",
  },
  {
    name: "Audio",
    image:
      "https://www.lg.com/ar/images/equipos-de-musica/md05877776/gallery/CM4460_Z01_130917.jpg",
  },
  {
    name: "Muebles",
    image:
      "https://www.shutterstock.com/shutterstock/photos/2539000939/display_1500/stock-photo-modern-lounge-chair-png-mockup-living-room-furniture-2539000939.jpg",
  },
  {
    name: "Hogar",
    image:
      "https://i.pinimg.com/1200x/53/0b/73/530b73b40dbb92fb2c247b1f6c5ef76a.jpg",
  },
  {
    name: "Climatización",
    image:
      "https://i.pinimg.com/736x/e3/be/a4/e3bea4421af314886ff2423d2d3a2746.jpg",
  },
  {
    name: "Electrodomésticos",
    image:
      "https://i.pinimg.com/736x/52/64/a1/5264a12da4977ca3d9fb06daa492184a.jpg",
  },
  {
    name: "Salud",
    image:
      "https://i.pinimg.com/736x/dc/bf/36/dcbf36412ff9bbd3961d09acc5ebfa50.jpg",
  },
  {
    name: "Infantiles",
    image:
      "https://i.pinimg.com/1200x/29/c9/08/29c9089a620ebf37ad257ef0f9b1b3d7.jpg",
  },
  {
    name: "Jardín",
    image:
      "https://i.pinimg.com/1200x/2b/9a/57/2b9a57ad0a2a36e23becfe0533975610.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="pt-[140px] px-4 max-w-7xl mx-auto">
      <Carousel />

      {/* Barra de beneficios */}
      <BenefitsBar />

      {/* Categorías */}
      <div className="bg-gray-100 mt-6 p-6 rounded-lg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-center">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="flex flex-col items-center cursor-pointer"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-20 h-20 object-contain rounded-full border"
            />
            <p className="mt-2 text-sm font-medium">{cat.name}</p>
          </Link>
        ))}
      </div>

      {/* Productos */}
      <HomeProductsSection />
      {/* Banner de catálogo */}
      <CatalogBanner />
    </main>
  );
}
