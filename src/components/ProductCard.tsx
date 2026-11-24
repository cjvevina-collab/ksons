import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Product, formatPkr } from '../data/catalog';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onAddToBag: (product: Product, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  onAddToBag,
}) => {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#DCEBEF] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <button
          type="button"
          onClick={() => onOpenProduct(product)}
          className="block w-full overflow-hidden rounded-xl border border-[#EAF2F4] bg-[#F5FAFB] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#118A9B]"
          aria-label={`Open ${product.name}`}
        >
          <div className="aspect-4/3 w-full overflow-hidden">
            <ProductImage
              src={product.image}
              alt={product.name}
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        </button>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-[#546A76]">
          <span className="truncate">
            {product.category}
            {product.subcategory ? ` · ${product.subcategory}` : ''}
          </span>
          <span
            className={`shrink-0 font-semibold ${
              product.availability === 'Out of Stock'
                ? 'text-[#B42318]'
                : 'text-[#118A9B]'
            }`}
          >
            {product.availability}
          </span>
        </div>

        <h3 className="mt-1.5 font-display text-base font-bold text-[#0E171D]">
          <button
            type="button"
            onClick={() => onOpenProduct(product)}
            className="line-clamp-1 text-left transition-colors hover:text-[#118A9B] cursor-pointer"
          >
            {product.name}
          </button>
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-[#5A6F7B]">{product.fabric}</p>
      </div>

      <div className="mt-4 border-t border-[#EEF5F7] pt-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-lg font-bold text-[#0E171D] tabular-nums">
            {formatPkr(product.pricePkr)}
          </span>
          {product.compareAtPkr && (
            <span className="text-xs text-[#8A9BA5] line-through tabular-nums">
              {formatPkr(product.compareAtPkr)}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenProduct(product)}
            className="min-h-[40px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-xs font-semibold text-[#0E171D] transition-colors hover:bg-[#E7F4F6] whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Details
          </button>
          <button
            type="button"
            disabled={product.availability === 'Out of Stock'}
            onClick={() => onAddToBag(product, 1)}
            className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 ${
              product.availability === 'Out of Stock'
                ? 'cursor-not-allowed border border-[#E5E9EC] bg-[#F2F5F7] text-[#7D8C95]'
                : 'bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {product.availability === 'Out of Stock' ? 'Out of Stock' : 'Add to Bag'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
