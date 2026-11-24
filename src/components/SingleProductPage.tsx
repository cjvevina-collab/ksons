import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Lock,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Product, StoreSettings, formatPkr, toWhatsAppDigits } from '../data/catalog';
import { ProductImage } from './ProductImage';
import { ProductCard } from './ProductCard';

interface SingleProductPageProps {
  product: Product;
  allProducts: Product[];
  storeSettings: StoreSettings;
  onBackToShop: (category?: string) => void;
  onOpenProduct: (product: Product) => void;
  onAddToBag: (
    product: Product,
    quantity: number,
    options?: { size?: string; color?: string }
  ) => void;
}

export const SingleProductPage: React.FC<SingleProductPageProps> = ({
  product,
  allProducts,
  storeSettings,
  onBackToShop,
  onOpenProduct,
  onAddToBag,
}) => {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setSelectedImage(product.image);
    setSelectedSize(
      product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
    );
    setSelectedColor(
      product.colors && product.colors.length > 0 ? product.colors[0].name : undefined
    );
    setQuantity(1);
    setJustAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const relatedProducts = allProducts
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);

  const fallbackRelated =
    relatedProducts.length > 0
      ? relatedProducts
      : allProducts.filter((item) => item.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    onAddToBag(product, quantity, {
      size: selectedSize,
      color: selectedColor,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  const whatsappUrl = `https://wa.me/${toWhatsAppDigits(storeSettings.primaryPhone)}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${storeSettings.brandName}, I want to order:\n- Product: ${product.name}${selectedColor ? `\n- Color: ${selectedColor}` : ''}${selectedSize ? `\n- Size: ${selectedSize}` : ''}\n- Quantity: ${quantity}\n- Total: ${formatPkr(product.pricePkr * quantity)}`
  )}`;

  const galleryList =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  return (
    <div className="bg-[#F5FAFB] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[#DCEBEF] pb-4 text-xs font-medium text-[#546A76]">
          <button
            type="button"
            onClick={() => onBackToShop('All')}
            className="inline-flex items-center gap-1.5 font-semibold text-[#118A9B] hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Shop</span>
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => onBackToShop(product.category)}
            className="hover:text-[#0E171D] cursor-pointer"
          >
            {product.category}
          </button>
          {product.subcategory && (
            <>
              <span aria-hidden="true">/</span>
              <span>{product.subcategory}</span>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-[#0E171D]">{product.name}</span>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Left Sticky Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-6">
            <div className="aspect-4/3 w-full overflow-hidden rounded-2xl border border-[#DCEBEF] bg-white shadow-xs">
              <ProductImage
                src={selectedImage}
                alt={product.name}
                className="h-full w-full"
              />
            </div>

            {galleryList.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                {galleryList.map((imgUrl, idx) => {
                  const active = imgUrl === selectedImage;
                  return (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`aspect-4/3 overflow-hidden rounded-xl border bg-white transition-all cursor-pointer ${
                        active
                          ? 'border-[#118A9B] ring-2 ring-[#23B5C8]/35'
                          : 'border-[#DCEBEF] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <ProductImage
                        src={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="h-full w-full"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Purchase Column */}
          <div className="rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:p-8 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#546A76]">
              <span>{product.category}</span>
              {product.subcategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{product.subcategory}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span
                className={
                  product.availability === 'Out of Stock'
                    ? 'text-[#B42318]'
                    : 'text-[#118A9B]'
                }
              >
                {product.availability}
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#0E171D] uppercase sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-[#0E171D] tabular-nums">
                {formatPkr(product.pricePkr)}
              </span>
              {product.compareAtPkr && (
                <span className="text-base text-[#8A9BA5] line-through tabular-nums">
                  {formatPkr(product.compareAtPkr)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#425561] sm:text-base">
              {product.description}
            </p>

            {/* Admin-configured Color Options (only rendered if admin added colors) */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6 border-t border-[#EBF3F5] pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0E171D] uppercase">Color</span>
                  <span className="font-medium text-[#546A76]">{selectedColor}</span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    const active = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`inline-flex min-h-[38px] items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                          active
                            ? 'border-[#118A9B] bg-[#EEF9FB] text-[#0E171D]'
                            : 'border-[#DCEBEF] bg-white text-[#425561]'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/15"
                          style={{ backgroundColor: c.hex }}
                          aria-hidden="true"
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin-configured Size Options (only rendered if admin ticked sizes) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-5 border-t border-[#EBF3F5] pt-5">
                <span className="block text-xs font-bold text-[#0E171D] uppercase">
                  Select Size
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.sizes.map((sz) => {
                    const active = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`min-h-[38px] min-w-[44px] rounded-lg border px-3 py-1.5 font-display text-xs font-bold cursor-pointer ${
                          active
                            ? 'border-[#118A9B] bg-[#118A9B] text-white'
                            : 'border-[#DCEBEF] bg-white text-[#0E171D] hover:border-[#9EB0BA]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fabric & Key Highlights */}
            <div className="mt-6 space-y-4 border-t border-[#EBF3F5] pt-5">
              {product.fabric && (
                <div>
                  <p className="text-xs font-bold tracking-wider text-[#546A76] uppercase">
                    Material
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#0E171D]">
                    {product.fabric}
                  </p>
                </div>
              )}

              {product.highlights && product.highlights.length > 0 && (
                <div>
                  <p className="text-xs font-bold tracking-wider text-[#546A76] uppercase">
                    Highlights
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-[#3A4D58]">
                    {product.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quantity & Purchase CTA */}
            <div className="mt-7 border-t border-[#EBF3F5] pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex min-h-[46px] items-center justify-between rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-2 sm:w-36">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-[#2A3942] hover:text-[#0E171D] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="font-display text-base font-bold text-[#0E171D] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="flex h-10 w-10 items-center justify-center text-[#2A3942] hover:text-[#0E171D] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={product.availability === 'Out of Stock'}
                  onClick={handleAdd}
                  className={`inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-display text-sm font-semibold whitespace-nowrap ${
                    product.availability === 'Out of Stock'
                      ? 'cursor-not-allowed border border-[#E5E9EC] bg-[#F2F5F7] text-[#7D8C95]'
                      : 'bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white shadow-sm transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer'
                  }`}
                >
                  {product.availability === 'Out of Stock' ? (
                    <span>Currently Out of Stock</span>
                  ) : justAdded ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      <span>
                        Add to Bag · {formatPkr(product.pricePkr * quantity)}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg border border-[#D4E3E7] bg-white px-5 py-3 text-sm font-semibold text-[#0E171D] transition-colors hover:bg-[#F5FAFB]"
              >
                <MessageCircle className="h-4 w-4 text-[#118A9B]" aria-hidden="true" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#EBF3F5] pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 text-xs text-[#425561]">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                <span>100% Free nationwide delivery</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#425561]">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                <span>Sealed unmarked parcel</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-[#425561]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
                <span>
                  {[
                    storeSettings.codEnabled ? 'COD' : '',
                    storeSettings.easypaisaEnabled ? 'Easypaisa' : '',
                    storeSettings.jazzcashEnabled ? 'JazzCash' : '',
                    storeSettings.bankEnabled ? 'Bank' : '',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Direct Order'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-14 border-t border-[#DCEBEF] pt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold text-[#0E171D] uppercase">
              More From {product.category}
            </h2>
            <button
              type="button"
              onClick={() => onBackToShop(product.category)}
              className="text-sm font-semibold text-[#118A9B] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fallbackRelated.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onOpenProduct={onOpenProduct}
                onAddToBag={(p, qty) => onAddToBag(p, qty)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
