import React from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import { CategoryItem, PRODUCT_IMAGES, Product } from '../data/catalog';
import { ProductImage } from './ProductImage';

interface CategoriesPageProps {
  categories: CategoryItem[];
  products: Product[];
  onSelectCategory: (category: string, subcategory?: string) => void;
  onGoShopAll: () => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  products,
  onSelectCategory,
  onGoShopAll,
}) => {
  return (
    <div className="bg-[#F5FAFB]">
      {/* Compact Full-Width Categories Banner */}
      <section className="relative w-full overflow-hidden bg-[#09181D]">
        <div className="relative min-h-[210px] w-full sm:min-h-[250px]">
          <ProductImage
            src={PRODUCT_IMAGES[15]}
            alt="K&SON'S COLLECTION'S Categories"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
          <div className="relative z-10 mx-auto flex min-h-[210px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[250px] sm:px-6 lg:px-8">
            <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
              Collections Directory
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
              All Categories
            </h1>
            <p className="mt-2 max-w-lg text-sm text-[#E4F1F4]">
              Explore every category and subcategory with free nationwide delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs font-bold tracking-wider text-[#118A9B] uppercase">
              {categories.length} Collections
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase">
              Browse by Category &amp; Subcategory
            </h2>
          </div>

          <button
            type="button"
            onClick={onGoShopAll}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 font-display text-xs font-bold text-white uppercase transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer"
          >
            <span>Shop All Products ({products.length})</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.name).length;
            return (
              <div
                key={cat.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#DCEBEF] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className="block w-full overflow-hidden bg-[#F5FAFB] text-left cursor-pointer"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden">
                      <ProductImage
                        src={cat.image || PRODUCT_IMAGES[0]}
                        alt={cat.name}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </button>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectCategory(cat.name)}
                        className="text-left font-display text-lg font-extrabold text-[#0E171D] uppercase transition-colors group-hover:text-[#118A9B] cursor-pointer"
                      >
                        {cat.name}
                      </button>
                      <span className="shrink-0 text-xs font-semibold text-[#546A76] tabular-nums">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {cat.subcategories.length > 0 ? (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => onSelectCategory(cat.name, sub)}
                            className="rounded-md border border-[#DCEBEF] bg-[#F5FAFB] px-2.5 py-1 text-xs font-medium text-[#334550] transition-colors hover:border-[#118A9B] hover:bg-[#EEF9FB] hover:text-[#118A9B] cursor-pointer"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-[#546A76]">
                        <Layers className="h-3.5 w-3.5 text-[#118A9B]" aria-hidden="true" />
                        <span>View full collection</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#EEF5F7] px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.name)}
                    className="inline-flex w-full items-center justify-between font-display text-xs font-bold text-[#118A9B] uppercase hover:text-[#0D7280] cursor-pointer"
                  >
                    <span>Explore {cat.name}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
