import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  Copy,
  Lock,
  MessageCircle,
  Smartphone,
  Wallet,
} from 'lucide-react';
import {
  OrderRecord,
  PaymentMethod,
  StoreSettings,
  formatPkr,
  toWhatsAppDigits,
} from '../data/catalog';
import { CartEntry } from './CartDrawer';
import { ProductImage } from './ProductImage';

interface CheckoutPageProps {
  items: CartEntry[];
  storeSettings: StoreSettings;
  onBackToShop: () => void;
  onPlaceOrder: (order: OrderRecord) => Promise<void>;
}

interface PaymentOptionConfig {
  id: PaymentMethod;
  label: string;
  hint: string;
  details?: string;
  icon: typeof Banknote;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  storeSettings,
  onBackToShop,
  onPlaceOrder,
}) => {
  const availablePaymentOptions = useMemo<PaymentOptionConfig[]>(() => {
    const list: PaymentOptionConfig[] = [];
    if (storeSettings.codEnabled) {
      list.push({
        id: 'Cash on Delivery',
        label: 'Cash on Delivery',
        hint: 'Pay cash at your doorstep upon parcel arrival',
        icon: Banknote,
      });
    }
    if (storeSettings.easypaisaEnabled) {
      list.push({
        id: 'Easypaisa',
        label: 'Easypaisa',
        hint: `${storeSettings.easypaisaNumber || storeSettings.primaryPhone}`,
        details: storeSettings.easypaisaAccountTitle
          ? `Account Title: ${storeSettings.easypaisaAccountTitle}`
          : undefined,
        icon: Smartphone,
      });
    }
    if (storeSettings.jazzcashEnabled) {
      list.push({
        id: 'JazzCash',
        label: 'JazzCash',
        hint: `${storeSettings.jazzcashNumber || storeSettings.secondaryPhone}`,
        details: storeSettings.jazzcashAccountTitle
          ? `Account Title: ${storeSettings.jazzcashAccountTitle}`
          : undefined,
        icon: Wallet,
      });
    }
    if (storeSettings.bankEnabled) {
      list.push({
        id: 'Online Bank Transfer',
        label: 'Online Bank Transfer',
        hint: [storeSettings.bankName, storeSettings.bankAccountNumber]
          .filter(Boolean)
          .join(' · '),
        details: [
          storeSettings.bankAccountTitle
            ? `Title: ${storeSettings.bankAccountTitle}`
            : '',
          storeSettings.bankIban ? `IBAN: ${storeSettings.bankIban}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
        icon: Building2,
      });
    }
    if (list.length === 0) {
      list.push({
        id: 'Cash on Delivery',
        label: 'Cash on Delivery',
        hint: 'Pay cash at your doorstep upon parcel arrival',
        icon: Banknote,
      });
    }
    return list;
  }, [storeSettings]);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    availablePaymentOptions[0].id
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!availablePaymentOptions.some((opt) => opt.id === paymentMethod)) {
      setPaymentMethod(availablePaymentOptions[0].id);
    }
  }, [availablePaymentOptions, paymentMethod]);

  const subtotalPkr = items.reduce(
    (sum, item) => sum + item.pricePkr * item.quantity,
    0
  );
  const deliveryPkr = 0;
  const totalPkr = subtotalPkr;

  const selectedOptionObj = availablePaymentOptions.find(
    (opt) => opt.id === paymentMethod
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      setFormError('Please fill in your name, phone number, city, and full address.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setFormError('Please enter a valid 11-digit mobile number.');
      return;
    }

    setFormError('');
    setSubmitting(true);

    const orderNumber = `KS-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderRecord: OrderRecord = {
      orderId: orderNumber,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      paymentMethod,
      items: items.map(
        ({ productId, name, image, selectedSize, selectedColor, quantity, pricePkr }) => ({
          productId,
          name,
          image,
          ...(selectedSize ? { selectedSize } : {}),
          ...(selectedColor ? { selectedColor } : {}),
          quantity,
          pricePkr,
        })
      ),
      subtotalPkr,
      deliveryPkr,
      totalPkr,
      status: 'Confirmed',
      estimatedWindow: 'Dispatches within 24 hours · 2–4 working days delivery',
    };

    try {
      await onPlaceOrder(orderRecord);
      setConfirmedOrder(orderRecord);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setFormError('Unable to save order right now. Please try again or order on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = async () => {
    if (!confirmedOrder) return;
    try {
      await navigator.clipboard.writeText(confirmedOrder.orderId);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 1800);
    } catch {
      setCopiedId(false);
    }
  };

  if (confirmedOrder) {
    const waDigits = toWhatsAppDigits(storeSettings.primaryPhone);
    const whatsappReceiptUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(
      `New Order ${confirmedOrder.orderId} (${storeSettings.brandName})\nName: ${confirmedOrder.customerName}\nPhone: ${confirmedOrder.phone}\nCity: ${confirmedOrder.city}\nAddress: ${confirmedOrder.address}\nPayment: ${confirmedOrder.paymentMethod}\nItems:\n${confirmedOrder.items
        .map(
          (i) =>
            `- ${i.name}${i.selectedColor ? ` (${i.selectedColor})` : ''}${i.selectedSize ? ` [Size ${i.selectedSize}]` : ''} x${i.quantity} = ${formatPkr(i.pricePkr * i.quantity)}`
        )
        .join('\n')}\nTotal: ${formatPkr(confirmedOrder.totalPkr)}`
    )}`;

    return (
      <div className="bg-[#F5FAFB] py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#BCE3E8] bg-white p-6 shadow-xs sm:p-10">
            <div className="flex items-center gap-3 text-[#118A9B]">
              <CheckCircle2 className="h-7 w-7 shrink-0" aria-hidden="true" />
              <h1 className="font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
                Order Confirmed
              </h1>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#DCEBEF] bg-[#F5FAFB] p-4">
              <div>
                <p className="text-xs font-semibold text-[#546A76] uppercase">
                  Your Order ID
                </p>
                <p className="mt-0.5 font-display text-2xl font-extrabold text-[#0E171D] tabular-nums">
                  {confirmedOrder.orderId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4E3E7] bg-white px-3 py-2 text-xs font-semibold text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="mt-6 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#546A76]">Customer</span>
                <span className="font-semibold text-[#0E171D]">{confirmedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#546A76]">Phone</span>
                <span className="font-semibold text-[#0E171D] tabular-nums">{confirmedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#546A76]">City</span>
                <span className="font-semibold text-[#0E171D]">{confirmedOrder.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#546A76]">Payment Method</span>
                <span className="font-semibold text-[#118A9B]">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-[#EBF3F5] pt-3 font-display text-lg font-bold text-[#0E171D]">
                <span>Total Payable</span>
                <span className="tabular-nums">{formatPkr(confirmedOrder.totalPkr)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-3 font-display text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Send Receipt on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onBackToShop}
                className="min-h-[46px] rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-5 py-3 font-display text-sm font-semibold text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#F5FAFB] py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <h1 className="font-display text-2xl font-extrabold text-[#0E171D] uppercase">
            Your Bag Is Empty
          </h1>
          <p className="mt-2 text-sm text-[#546A76]">
            Add products to your bag before checking out.
          </p>
          <button
            type="button"
            onClick={onBackToShop}
            className="mt-6 min-h-[44px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-6 py-2.5 font-display text-sm font-semibold text-white cursor-pointer"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5FAFB] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#118A9B] hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Shop</span>
        </button>

        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#0E171D] uppercase sm:text-4xl">
          Easy Checkout
        </h1>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Checkout Form */}
          <form
            id="main-checkout-form"
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:p-8 lg:col-span-7"
          >
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-[#F0B4AE] bg-[#FEF3F2] px-4 py-3 text-xs font-semibold text-[#B42318]"
              >
                {formError}
              </div>
            )}

            <div>
              <h2 className="font-display text-lg font-bold text-[#0E171D] uppercase">
                01. Delivery Details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="co-name" className="block text-xs font-semibold text-[#0E171D]">
                    Full Name
                  </label>
                  <input
                    id="co-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="co-phone" className="block text-xs font-semibold text-[#0E171D]">
                    Mobile / WhatsApp Number
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="co-city" className="block text-xs font-semibold text-[#0E171D]">
                  City
                </label>
                <input
                  id="co-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi, Lahore, Islamabad, Rawalpindi..."
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="co-address" className="block text-xs font-semibold text-[#0E171D]">
                  Complete Street Address
                </label>
                <textarea
                  id="co-address"
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No, Street, Block / Sector, Landmark"
                  className="mt-1.5 w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <label htmlFor="co-notes" className="block text-xs font-semibold text-[#0E171D]">
                  Delivery Note (Optional)
                </label>
                <input
                  id="co-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery"
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Dynamic Payment Options */}
            <div className="border-t border-[#EBF3F5] pt-6">
              <h2 className="font-display text-lg font-bold text-[#0E171D] uppercase">
                02. Payment Method
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {availablePaymentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        active
                          ? 'border-[#118A9B] bg-[#EEF9FB]'
                          : 'border-[#DCEBEF] bg-white hover:border-[#A7CBD3]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={active}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="mt-1 accent-[#118A9B]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#118A9B]" aria-hidden="true" />
                          <span className="font-display text-sm font-bold text-[#0E171D]">
                            {opt.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#546A76] break-words">{opt.hint}</p>
                        {opt.details && (
                          <p className="mt-0.5 text-[11px] font-medium text-[#118A9B] break-words">
                            {opt.details}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {selectedOptionObj && selectedOptionObj.id !== 'Cash on Delivery' && (
                <div className="mt-4 rounded-xl border border-[#BCE3E8] bg-[#EEF8F9] p-4 text-xs text-[#0D7280]">
                  <p className="font-display font-bold uppercase">
                    {selectedOptionObj.label} Account Details
                  </p>
                  <p className="mt-1 font-medium">{selectedOptionObj.hint}</p>
                  {selectedOptionObj.details && (
                    <p className="mt-0.5">{selectedOptionObj.details}</p>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Right Order Summary */}
          <div className="rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-5">
            <h2 className="font-display text-lg font-bold text-[#0E171D] uppercase">
              Order Summary
            </h2>

            <ul className="mt-4 divide-y divide-[#EBF3F5]">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#DCEBEF]">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-[#0E171D]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#546A76]">
                      Qty {item.quantity}
                      {item.selectedColor ? ` · ${item.selectedColor}` : ''}
                      {item.selectedSize ? ` · Size ${item.selectedSize}` : ''}
                    </p>
                  </div>
                  <span className="font-display text-sm font-bold text-[#0E171D] tabular-nums">
                    {formatPkr(item.pricePkr * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-[#DCEBEF] pt-4 text-sm">
              <div className="flex justify-between text-[#546A76]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0E171D] tabular-nums">
                  {formatPkr(subtotalPkr)}
                </span>
              </div>
              <div className="flex justify-between text-[#546A76]">
                <span>Discreet Delivery</span>
                <span className="font-semibold text-[#0E171D] tabular-nums">
                  {deliveryPkr === 0 ? 'FREE' : formatPkr(deliveryPkr)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#DCEBEF] pt-3 font-display text-lg font-extrabold text-[#0E171D]">
                <span>Total</span>
                <span className="tabular-nums">{formatPkr(totalPkr)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="main-checkout-form"
              disabled={submitting}
              className="mt-6 min-h-[48px] w-full rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-6 py-3 font-display text-sm font-bold text-white shadow-sm transition-all hover:from-[#0E7483] hover:to-[#179EB0] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Confirming Order...' : `Place Order · ${formatPkr(totalPkr)}`}
            </button>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#546A76]">
              <Lock className="h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
              <span>Sealed unmarked privacy parcel packaging included.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
