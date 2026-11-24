import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES } from '../data/catalog';
import { ProductImage } from './ProductImage';

interface HeroCarouselProps {
  onSelectCategory: (category: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  onSelectCategory,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[activeSlide];

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      aria-label="Featured storefront banner"
      className="relative w-full overflow-hidden bg-[#0A181D]"
    >
      <div className="relative min-h-[340px] w-full sm:min-h-[410px] lg:min-h-[450px]">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              idx === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ProductImage
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/85 via-[#07151A]/55 to-transparent" />
          </div>
        ))}

        {/* Clean Minimal Overlay */}
        <div className="relative z-10 mx-auto flex min-h-[340px] max-w-7xl flex-col justify-end px-4 py-10 sm:min-h-[410px] sm:justify-center sm:px-6 lg:min-h-[450px] lg:px-8">
          <div className="max-w-lg">
            <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
              {current.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl leading-[1.1] font-extrabold tracking-tight text-white uppercase sm:text-4xl lg:text-5xl">
              {current.title}
            </h1>
            <p className="mt-2.5 text-sm text-[#E4F1F4] sm:text-base">
              {current.subtitle}
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => onSelectCategory(current.targetCategory)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2.5 font-display text-sm font-semibold text-white shadow-md transition-all duration-150 hover:from-[#0E7483] hover:to-[#1CA2B4] whitespace-nowrap cursor-pointer"
              >
                <span>{current.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === activeSlide
                      ? 'brand-gradient w-8'
                      : 'w-2 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-xs transition-colors hover:bg-black/55 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-xs transition-colors hover:bg-black/55 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
