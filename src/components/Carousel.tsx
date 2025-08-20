"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Importa estilos de Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const FALLBACK_IMAGES = [
  "https://www.perozzi.com.ar/img/cms/home/2025/08/naranja-d.jpg",
  "https://www.perozzi.com.ar/img/cms/home/2025/01/Horarios-d.jpg",
  "https://www.perozzi.com.ar/img/cms/home/2025/08/hipotecario-d.jpg",
  "https://www.perozzi.com.ar/img/cms/home/2025/08/envios-gratis-d_v2.jpg",
];

export default function Carousel({
  images = FALLBACK_IMAGES,
  heightSmall = "h-[260px]",
  heightLarge = "h-[420px]",
}: {
  images?: string[];
  heightSmall?: string;
  heightLarge?: string;
}) {
  return (
    <div className={`w-full ${heightSmall} md:${heightLarge}`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        loop
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        className="w-full h-full"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
