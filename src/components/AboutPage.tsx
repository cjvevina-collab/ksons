import React, { useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Lock,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { PRODUCT_IMAGES, QUALITY_PARTNERS, StoreSettings } from '../data/catalog';
import { BrandLogo } from './BrandLogo';
import { ProductImage } from './ProductImage';

interface AboutPageProps {
  storeSettings: StoreSettings;
  onGoShop: () => void;
  onGoContact: () => void;
}

const PILLARS = [
  {
    icon: Lock,
    title: '100% Privacy Packing',
    text: 'Plain opaque outer parcels with zero product labels.',
  },
  {
    icon: Sparkles,
    title: 'Skin-First Fabrics',
    text: 'Combed cotton, micro-modal, soft fleece, and satin.',
  },
  {
    icon: Truck,
    title: 'Nationwide COD',
    text: 'Fast doorstep delivery across all cities in Pakistan.',
  },
  {
    icon: HeartHandshake,
    title: 'Direct Support',
    text: 'WhatsApp assistance anytime on 0315-5588282.',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({
  storeSettings,
  onGoShop,
  onGoContact,
}) => {
  const pillarsRef = useRef<HTMLDivElement | null>(null);
  const standardsRef = useRef<HTMLDivElement | null>(null);

  const scrollTrack = (
    ref: React.RefObject<HTMLDivElement | null>,
    dir: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === 'left' ? -280 : 280,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-[#F5FAFB]">
      {/* Compact Full-Width Banner */}
      <section className="relative w-full overflow-hidden bg-[#09181D]">
        <div className="relative min-h-[210px] w-full sm:min-h-[250px]">
          <ProductImage
            src={PRODUCT_IMAGES[18]}
            alt="About K&SON'S COLLECTION'S"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
          <div className="relative z-10 mx-auto flex min-h-[210px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[250px] sm:px-6 lg:px-8">
            <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
              About Us
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
              Comfort &amp; Privacy First
            </h1>
          </div>
        </div>
      </section>

      {/* Brand Story Card */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-[#DCEBEF] bg-white p-6 sm:p-10 lg:grid-cols-12">
          <div className="brand-soft-bg flex flex-col items-center justify-center rounded-2xl p-8 text-center lg:col-span-4">
            <BrandLogo size="xl" />
            <h2 className="mt-4 font-display text-xl font-extrabold text-[#0E171D] uppercase">
              {storeSettings.brandName}
            </h2>
          </div>

          <div className="lg:col-span-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#0E171D] uppercase sm:text-3xl">
              Everyday Garments, Crafted for Pakistan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#425561] sm:text-base">
              From breathable everyday innerwear and soft winter high-necks to socks, shapewear, and bridal loungewear, every piece is inspected for comfort and shipped in sealed unmarked parcels.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGoShop}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 font-display text-sm font-semibold text-white cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onGoContact}
                className="inline-flex min-h-[42px] items-center rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-5 py-2 font-display text-sm font-semibold text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
              >
                Wholesale Desk
              </button>
            </div>
          </div>
        </div>

        {/* Slidable Core Pillars */}
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-xl font-extrabold text-[#0E171D] uppercase">
              Why Shop With Us
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTrack(pillarsRef, 'left')}
                aria-label="Scroll pillars left"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack(pillarsRef, 'right')}
                aria-label="Scroll pillars right"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            ref={pillarsRef}
            className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          >
            {PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="w-[260px] shrink-0 snap-start rounded-2xl border border-[#DCEBEF] bg-white p-5 sm:w-[290px]"
                >
                  <div className="brand-gradient inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h4 className="mt-3.5 font-display text-base font-bold text-[#0E171D]">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#546A76]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slidable Fabric Standards */}
        <div className="mt-10 rounded-2xl border border-[#DCEBEF] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#118A9B]" aria-hidden="true" />
              <h3 className="font-display text-lg font-extrabold text-[#0E171D] uppercase">
                Fabric Standards
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTrack(standardsRef, 'left')}
                aria-label="Scroll standards left"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4E3E7] bg-[#F5FAFB] text-[#0E171D] cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack(standardsRef, 'right')}
                aria-label="Scroll standards right"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4E3E7] bg-[#F5FAFB] text-[#0E171D] cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            ref={standardsRef}
            className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
          >
            {QUALITY_PARTNERS.map((item) => (
              <div
                key={item.title}
                className="w-[210px] shrink-0 snap-start rounded-xl border border-[#E6F1F4] bg-[#F5FAFB] p-4"
              >
                <p className="font-display text-sm font-bold text-[#0E171D]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#546A76]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
