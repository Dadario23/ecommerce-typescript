import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product, { IProduct } from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Truck,
  Store,
  CreditCard,
  Share2,
  Heart,
  CheckCircle,
  Home,
  ChevronRight,
  ZoomIn,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react";
import ImageGallery from "@/components/ImageGallery";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connectDB();

  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).toLowerCase().replace(/\s+/g, "-");

  const doc = (await Product.findOne({ slug }).lean()) as IProduct | null;

  if (!doc) {
    notFound();
  }

  // Calcular descuento si existe precio de comparación
  const discount =
    doc.compareAtPrice && doc.price
      ? Math.round(
          ((doc.compareAtPrice - doc.price) / doc.compareAtPrice) * 100
        )
      : 0;

  // Combinar todas las imágenes (principal + adicionales)
  const allImages = [doc.imageUrl, ...(doc.images || [])].filter(Boolean);

  return (
    <div className="pt-[140px] pb-16 bg-gray-50 min-h-screen">
      {/* Ruta de navegación */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <nav className="flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:underline flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          {doc.category && (
            <>
              <Link
                href={`/category/${doc.category.toLowerCase()}`}
                className="hover:underline capitalize"
              >
                {doc.category}
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
            </>
          )}
          <span className="text-gray-800 font-medium truncate max-w-xs">
            {doc.name}
          </span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sección de imágenes - ACTUALIZADA con galería */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white mb-2">
                {discount}% OFF
              </Badge>
            )}
            <Badge className="bg-blue-100 text-blue-800 mb-2">
              ¡Oferta del mes!
            </Badge>
          </div>

          {/* Componente de galería de imágenes */}
          <ImageGallery images={allImages} productName={doc.name} />
        </div>

        {/* Información del producto */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{doc.name}</h1>
            {doc.brand && (
              <p className="text-sm text-gray-500 mt-1">{doc.brand}</p>
            )}
            {doc.sku && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>SKU: {doc.sku}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Precios */}
          <div className="mb-6">
            {doc.compareAtPrice && (
              <p className="text-lg text-gray-500 line-through">
                ${doc.compareAtPrice.toLocaleString()}
              </p>
            )}
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-gray-900">
                ${doc.price.toLocaleString()}
              </p>
              {discount > 0 && (
                <Badge className="bg-red-100 text-red-800 text-base py-1">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Precio sin impuestos nacionales $
              {(doc.price * 0.82).toLocaleString("es-AR", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          {/* Botones de compra */}
          <div className="mb-6">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold mb-3">
              Comprar ahora
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" /> Favorito
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" /> Compartir
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Opciones de pago */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">
              Promociones bancarias
            </h3>

            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tarjeta Naranja</span>
                    <span className="text-green-600 font-semibold">
                      6 cuotas sin interés
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">$80.500 por mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Visa</span>
                    <span className="text-green-600 font-semibold">
                      12 cuotas
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">$126.653 por mes</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Opciones de envío */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Costos de envío</h3>
            <p className="text-sm text-gray-600 mb-3">
              Tu código postal actual es: 1402
            </p>

            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Envío SIN CARGO</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    A domicilio dentro de los 15 días
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Envío Express $10.000</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    A domicilio dentro de las 48hs hábiles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Retiro en tienda</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Sin cargo - Ver dirección y horarios
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción del producto */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="specs">Especificaciones</TabsTrigger>
              <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">
                  Características principales
                </h3>
                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {doc.description}
                </p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Pantalla de alta calidad con tecnología avanzada
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cámara de alta resolución para fotos nítidas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Batería de larga duración para uso prolongado</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Almacenamiento amplio para todos tus archivos</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="specs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Especificaciones técnicas
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Memoria interna</span>
                      <span className="font-medium">256GB</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Procesador</span>
                      <span className="font-medium">
                        Qualcomm Snapdragon 6 gen 3
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Núcleos</span>
                      <span className="font-medium">8 núcleos 2,4 GHz</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dimensiones</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Tamaño</span>
                      <span className="font-medium">162,1 x 77,9 x 7,4 mm</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Peso</span>
                      <span className="font-medium">191 gr</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Sistema operativo</span>
                      <span className="font-medium">Android 14</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="text-center py-8">
                <h4 className="font-semibold mb-2">Opiniones de clientes</h4>
                <p className="text-gray-600">
                  Este producto aún no tiene opiniones. Sé el primero en dejar
                  tu comentario.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
