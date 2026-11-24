import React from 'react';
import {
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Video,
} from 'lucide-react';
import { CategoryItem, StoreSettings, toWhatsAppDigits } from '../data/catalog';
import { BrandLogo } from './BrandLogo';
import { AppPage } from './Header';

interface FooterProps {
  categories: CategoryItem[];
  storeSettings: StoreSettings;
  onNavigate: (page: AppPage) => void;
  onSelectCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  categories,
  storeSettings,
  onNavigate,
  onSelectCategory,
}) => {
  const waDigits = toWhatsAppDigits(storeSettings.primaryPhone);

  return (
    <footer className="border-t border-[#DCEBEF] bg-white text-[#0E171D]">
      <div className="brand-gradient h-1 w-full" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Logo Alone (no text beside logo) */}
          <div className="lg:col-span-4">
            <BrandLogo size="lg" />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#546A76]">
              Everyday garments, innerwear, and winter essentials delivered discreetly across Pakistan.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              {storeSettings.facebookUrl && (
                <a
                  href={storeSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DCEBEF] bg-[#F5FAFB] text-[#118A9B] transition-all hover:scale-105 hover:border-[#118A9B]"
                >
                  <Facebook className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {storeSettings.instagramUrl && (
                <a
                  href={storeSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DCEBEF] bg-[#F5FAFB] text-[#118A9B] transition-all hover:scale-105 hover:border-[#118A9B]"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {storeSettings.tiktokUrl && (
                <a
                  href={storeSettings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DCEBEF] bg-[#F5FAFB] text-[#118A9B] transition-all hover:scale-105 hover:border-[#118A9B]"
                >
                  <Video className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DCEBEF] bg-[#F5FAFB] text-[#118A9B] transition-all hover:scale-105 hover:border-[#118A9B]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2: Pages */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-extrabold text-[#0E171D] uppercase">
              Pages
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#546A76]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#118A9B] cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#118A9B] cursor-pointer"
                >
                  Shop
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('categories')}
                  className="hover:text-[#118A9B] cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#118A9B] cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('track')}
                  className="hover:text-[#118A9B] cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#118A9B] cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-extrabold text-[#0E171D] uppercase">
              Collections
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-[#546A76]">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className="hover:text-[#118A9B] cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Desk */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-extrabold text-[#0E171D] uppercase">
              Customer Desk
            </h3>
            <div className="mt-4 space-y-3 text-sm text-[#546A76]">
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-[#118A9B]"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                <span className="tabular-nums">{storeSettings.primaryPhone}</span>
              </a>
              <a
                href={`tel:${storeSettings.secondaryPhone.replace(/[^+\d]/g, '')}`}
                className="flex items-center gap-2.5 hover:text-[#118A9B]"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                <span className="tabular-nums">{storeSettings.secondaryPhone}</span>
              </a>
              <a
                href={`mailto:${storeSettings.email}`}
                className="flex items-center gap-2.5 hover:text-[#118A9B]"
              >
                <Mail className="h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                <span>{storeSettings.email}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#E6F1F4] pt-6 text-xs text-[#6B7D88] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {storeSettings.brandName} · {storeSettings.domain}
          </p>
          <div className="flex items-center gap-4">
            <span>
              {[storeSettings.handle, storeSettings.tiktokHandle].filter(Boolean).join(' · ')}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="font-semibold text-[#546A76] hover:text-[#118A9B] cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
