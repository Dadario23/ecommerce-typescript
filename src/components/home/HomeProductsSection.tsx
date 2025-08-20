import CategoryBlock from "./CategoryBlock";

export default function HomeProductsSection() {
  // Productos estáticos para prueba
  const celulares = [
    {
      image:
        "https://www.perozzi.com.ar/57947-small_default/celular-tcl-50-se-4128-space-gray-.jpg",
      title: "Celular TCL 50 SE 4/128",
      price: "$ 229.999",
      installment10: "$ 22.900",
      installment12: "$ 18.750",
    },
    {
      image:
        "https://www.perozzi.com.ar/57942-small_default/celular-tcl-50-se-t611b1-6256-space-gray.jpg",
      title: "Celular TCL 50 SE 4/128",
      price: "$ 409.999",
      installment10: "$ 41.000",
      installment12: "$ 34.167",
    },
    {
      image:
        "https://www.perozzi.com.ar/57936-small_default/celular-tcl-50-t803e-8512-space-gray.jpg",
      title: "Celular Samsung Galaxy",
      price: "$ 599.999",
      installment10: "$ 60.000",
      installment12: "$ 50.000",
    },
  ];

  const smartTV = [
    {
      image:
        "https://www.perozzi.com.ar/58163-small_default/enova-led-32-te-32hg10-tdf-google-tv-hd-hdmi.jpg",
      title: "Noblex TV LED 32”",
      price: "$ 234.999",
      installment10: "$ 23.500",
      installment12: "$ 19.583",
    },
    {
      image:
        "https://www.perozzi.com.ar/57998-small_default/tcl-tv-led-55-55-p635-f-google-tv-uhd-usb-hdmi.jpg",
      title: "TCL TV LED 55”",
      price: "$ 599.999",
      installment10: "$ 60.000",
      installment12: "$ 50.000",
    },
    {
      image:
        "https://www.perozzi.com.ar/57816-small_default/quint-led-32-qt3-32-gtv2024-google-tv-hd-hdmi.jpg",
      title: "Philips TV LED 50”",
      price: "$ 359.999",
      installment10: "$ 34.000",
      installment12: "$ 30.000",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <CategoryBlock
        bannerImage="https://www.perozzi.com.ar/img/cms/home/home_celulares.jpg"
        bannerTitle="Celulares"
        products={celulares}
        catalogLink="/catalogo/celulares"
      />
      <CategoryBlock
        bannerImage="https://www.perozzi.com.ar/img/cms/home/home_smart_tv.jpg"
        bannerTitle="Smart TV"
        products={smartTV}
        catalogLink="/catalogo/smart-tv"
      />
    </div>
  );
}
