import React, { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { OrderItem, STORE_INFO, formatPkr } from '../data/catalog';
import { ProductImage } from './ProductImage';

export interface CartEntry extends OrderItem {
  key: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartEntry[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotalPkr = items.reduce(
    (sum, item) => sum + item.pricePkr * item.quantity,
    0
  );
  const deliveryPkr = 0;
  const totalPkr = subtotalPkr;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0E171D]/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bag-drawer-title"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-[#DCEBEF] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EBF3F5] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#118A9B]" aria-hidden="true" />
            <h2
              id="bag-drawer-title"
              className="font-display text-lg font-extrabold text-[#0E171D] uppercase"
            >
              Shopping Bag
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[#475863] transition-colors hover:bg-[#F5FAFB] hover:text-[#0E171D] cursor-pointer"
            aria-label="Close shopping bag"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F7F9] text-[#118A9B]">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-base font-bold text-[#0E171D]">
                Your bag is empty
              </p>
              <p className="mt-1 max-w-xs text-sm text-[#546A76]">
                Add garments or essentials from the store to check out.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 min-h-[40px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 text-sm font-semibold text-white cursor-pointer"
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-[#D7E9ED] bg-[#EEF9FB] p-3.5">
                <p className="text-xs font-semibold text-[#0D7280]">
                  100% FREE Nationwide Discreet Delivery unlocked on all orders.
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#DCEBEF]">
                  <div className="brand-gradient h-full w-full rounded-full" />
                </div>
              </div>

              <ul className="divide-y divide-[#EBF3F5]">
                {items.map((item) => (
                  <li key={item.key} className="flex items-start gap-3.5 py-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#DCEBEF] bg-[#F5FAFB]">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-[#0E171D]">
                        {item.name}
                      </p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="mt-0.5 text-xs text-[#546A76]">
                          {[item.selectedColor, item.selectedSize ? `Size ${item.selectedSize}` : '']
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs font-medium text-[#546A76] tabular-nums">
                        {formatPkr(item.pricePkr)} each
                      </p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-md border border-[#D4E3E7] bg-[#F5FAFB]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, -1)}
                            className="flex h-8 w-8 items-center justify-center text-[#334550] hover:text-[#0E171D] cursor-pointer"
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-6 text-center font-display text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, 1)}
                            className="flex h-8 w-8 items-center justify-center text-[#334550] hover:text-[#0E171D] cursor-pointer"
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          className="inline-flex items-center gap-1 text-xs text-[#6B7D88] hover:text-[#B42318] cursor-pointer"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    <p className="font-display text-sm font-bold text-[#0E171D] tabular-nums">
                      {formatPkr(item.pricePkr * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#EBF3F5] bg-[#F5FAFB] px-6 py-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#475863]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0E171D] tabular-nums">
                  {formatPkr(subtotalPkr)}
                </span>
              </div>
              <div className="flex justify-between text-[#475863]">
                <span>Discreet Delivery</span>
                <span className="font-semibold text-[#0E171D] tabular-nums">
                  {deliveryPkr === 0 ? 'FREE' : formatPkr(deliveryPkr)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#DCEBEF] pt-2 font-display text-base font-bold text-[#0E171D]">
                <span>Total</span>
                <span className="tabular-nums">{formatPkr(totalPkr)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="mt-4 min-h-[44px] w-full rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-4 py-2.5 font-display text-sm font-semibold text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer"
            >
              Proceed to Easy Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
