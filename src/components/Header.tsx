import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react';
import { CategoryItem, StoreSettings } from '../data/catalog';
import { BrandLogo } from './BrandLogo';

export type AppPage =
  | 'home'
  | 'shop'
  | 'categories'
  | 'about'
  | 'track'
  | 'contact'
  | 'product'
  | 'checkout'
  | 'admin';

interface HeaderProps {
  currentPage: AppPage;
  bagCount: number;
  categories: CategoryItem[];
  storeSettings: StoreSettings;
  onNavigate: (page: AppPage) => void;
  onSelectCategory: (category: string, subcategory?: string) => void;
  onOpenBag: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  bagCount,
  categories,
  storeSettings,
  onNavigate,
  onSelectCategory,
  onOpenBag,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleNavClick = (page: AppPage) => {
    setMobileMenuOpen(false);
    setCatMenuOpen(false);
    onNavigate(page);
  };

  const handlePickCategory = (cat: string, sub?: string) => {
    setCatMenuOpen(false);
    setMobileMenuOpen(false);
    onSelectCategory(cat, sub);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#D7E9ED] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8">
        {/* Zone 1: Enlarged Crisp Logo + Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#118A9B]"
        >
          <BrandLogo size="sm" />
          <span className="font-display text-lg font-extrabold tracking-tight text-[#0E171D] uppercase sm:text-xl">
            {storeSettings.shortMark}
          </span>
        </button>

        {/* Zone 2: Single-line navigation including Shop & Categories */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-5 lg:flex lg:gap-6"
        >
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'home'
                ? 'text-[#118A9B] underline decoration-2 underline-offset-8'
                : 'text-[#425561] hover:text-[#0E171D]'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handlePickCategory('All')}
            className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'shop' || currentPage === 'product'
                ? 'text-[#118A9B] underline decoration-2 underline-offset-8'
                : 'text-[#425561] hover:text-[#0E171D]'
            }`}
          >
            Shop
          </button>

          {/* Categories Dropdown + Dedicated Categories Page */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setCatMenuOpen((prev) => !prev)}
              aria-expanded={catMenuOpen}
              className={`inline-flex items-center gap-1 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'categories'
                  ? 'text-[#118A9B] underline decoration-2 underline-offset-8'
                  : 'text-[#425561] hover:text-[#0E171D]'
              }`}
            >
              <span>Categories</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${
                  catMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {catMenuOpen && (
              <div className="absolute top-full left-0 z-50 mt-3 w-[660px] max-w-[90vw] rounded-2xl border border-[#DCEBEF] bg-white p-5 shadow-2xl">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#EBF3F5] pb-2.5">
                  <button
                    type="button"
                    onClick={() => handleNavClick('categories')}
                    className="font-display text-xs font-extrabold tracking-wider text-[#118A9B] uppercase hover:underline cursor-pointer"
                  >
                    Open Categories Page →
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePickCategory('All')}
                    className="text-xs font-semibold text-[#0E171D] hover:text-[#118A9B] cursor-pointer"
                  >
                    Shop All Products →
                  </button>
                </div>

                <div className="grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handlePickCategory(cat.name)}
                        className="block text-left font-display text-sm font-bold text-[#0E171D] hover:text-[#118A9B] cursor-pointer"
                      >
                        {cat.name}
                      </button>
                      {cat.subcategories.length > 0 && (
                        <ul className="space-y-0.5">
                          {cat.subcategories.map((sub) => (
                            <li key={sub}>
                              <button
                                type="button"
                                onClick={() => handlePickCategory(cat.name, sub)}
                                className="text-left text-xs text-[#546A76] hover:text-[#118A9B] cursor-pointer"
                              >
                                {sub}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'about'
                ? 'text-[#118A9B] underline decoration-2 underline-offset-8'
                : 'text-[#425561] hover:text-[#0E171D]'
            }`}
          >
            About Us
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('track')}
            className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'track'
                ? 'text-[#118A9B] underline decoration-2 underline-offset-8'
                : 'text-[#425561] hover:text-[#0E171D]'
            }`}
          >
            Track Order
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className={`py-1.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === 'contact'
                ? 'text-[#118A9B] underline decoration-2 underline-offset-8'
                : 'text-[#425561] hover:text-[#0E171D]'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Primary Bag CTA + Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 sm:gap-3">
          <button
            type="button"
            onClick={onOpenBag}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-3.5 py-2 font-display text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:from-[#0E7382] hover:to-[#1CA2B4] whitespace-nowrap shrink-0 cursor-pointer sm:px-4"
            aria-label={`Open shopping bag with ${bagCount} items`}
          >
            <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">Bag ({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-lg border border-[#D4DFE4] bg-[#F5FAFB] text-[#0E171D] lg:hidden cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="max-h-[75vh] overflow-y-auto border-t border-[#D7E9ED] bg-white px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-left text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB]"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => handlePickCategory('All')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-left text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB]"
            >
              Shop
            </button>

            <button
              type="button"
              onClick={() => setMobileCatOpen((p) => !p)}
              className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB]"
            >
              <span>Categories</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  mobileCatOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {mobileCatOpen && (
              <div className="ml-3 space-y-2 border-l border-[#D7E9ED] pl-3 py-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('categories')}
                  className="block py-1 text-xs font-extrabold text-[#118A9B] uppercase"
                >
                  All Categories Page →
                </button>
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handlePickCategory(cat.name)}
                      className="block py-1 text-xs font-bold text-[#0E171D]"
                    >
                      {cat.name}
                    </button>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handlePickCategory(cat.name, sub)}
                        className="block py-0.5 pl-2 text-xs text-[#546A76]"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-left text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB]"
            >
              About Us
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('track')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-left text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB]"
            >
              Track Order
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-left text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB]"
            >
              Contact
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
