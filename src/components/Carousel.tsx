"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const FALLBACK_IMAGES = [
  "https://i.ibb.co/b5xjn536/Chat-GPT-Image-11-may-2026-02-01-04-a-m.png",
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
    <div className={`w-full ${heightSmall} md:${heightLarge} rounded-xl overflow-hidden`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        loop={images.length > 1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={images.length > 1}
        className="w-full h-full"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i} className="relative w-full h-full">
            <Image
              src={src}
              alt={`Banner ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
