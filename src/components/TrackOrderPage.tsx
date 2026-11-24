import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { PackageSearch, ShieldCheck } from 'lucide-react';
import { OrderRecord, PRODUCT_IMAGES, StoreSettings, formatPkr } from '../data/catalog';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';
import { ProductImage } from './ProductImage';

interface TrackOrderPageProps {
  orders: OrderRecord[];
  storeSettings: StoreSettings;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  orders,
  storeSettings,
}) => {
  const [lookupId, setLookupId] = useState('KS-2035');
  const [searchedId, setSearchedId] = useState('KS-2035');
  const [matchedOrder, setMatchedOrder] = useState<OrderRecord | null>(
    () => orders.find((o) => o.orderId.toUpperCase() === 'KS-2035') || null
  );
  const [searching, setSearching] = useState(false);

  const runSearch = async (targetId: string) => {
    const normalized = targetId.trim().toUpperCase();
    setSearchedId(normalized);
    if (!normalized) {
      setMatchedOrder(null);
      return;
    }

    const localMatch = orders.find(
      (o) => o.orderId.toUpperCase() === normalized
    );
    if (localMatch) {
      setMatchedOrder(localMatch);
      return;
    }

    setSearching(true);
    try {
      const snap = await getDoc(doc(db, 'orders', normalized));
      if (snap.exists()) {
        setMatchedOrder(snap.data() as OrderRecord);
      } else {
        setMatchedOrder(null);
      }
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.GET, `orders/${normalized}`);
      } catch {
        setMatchedOrder(null);
      }
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const localMatch = orders.find(
      (o) => o.orderId.toUpperCase() === searchedId.toUpperCase()
    );
    if (localMatch) {
      setMatchedOrder(localMatch);
    }
  }, [orders, searchedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(lookupId);
  };

  return (
    <div className="bg-[#F5FAFB]">
      {/* Compact Full-Width Track Order Banner */}
      <section className="relative w-full overflow-hidden bg-[#09181D]">
        <div className="relative min-h-[200px] w-full sm:min-h-[240px]">
          <ProductImage
            src={PRODUCT_IMAGES[3]}
            alt="Track your K&SON'S order"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
          <div className="relative z-10 mx-auto flex min-h-[200px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[240px] sm:px-6 lg:px-8">
            <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
              Order Status
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
              Track Your Order
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-2.5">
              <div className="brand-gradient inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                <PackageSearch className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-extrabold text-[#0E171D] uppercase">
                Check Parcel Status
              </h2>
            </div>

            <p className="mt-3 text-sm text-[#425561]">
              Try sample order{' '}
              <button
                type="button"
                onClick={() => {
                  setLookupId('KS-2035');
                  void runSearch('KS-2035');
                }}
                className="font-display font-bold text-[#118A9B] underline underline-offset-2 cursor-pointer"
              >
                KS-2035
              </button>{' '}
              or enter an Order ID you placed in checkout.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="track-order-id" className="sr-only">
                Order ID
              </label>
              <input
                id="track-order-id"
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="e.g. KS-2035"
                className="min-h-[44px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-4 py-2 font-display text-sm font-semibold text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={searching}
                className="min-h-[44px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-6 py-2.5 font-display text-sm font-semibold text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {searching ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-[#DCEBEF] bg-[#F5FAFB] p-5">
              {matchedOrder ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-[#DCEBEF] pb-3">
                    <div>
                      <p className="text-xs text-[#546A76]">Order Number</p>
                      <p className="font-display text-xl font-bold text-[#0E171D] tabular-nums">
                        {matchedOrder.orderId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#546A76]">Current Status</p>
                      <p className="font-display text-sm font-bold text-[#118A9B]">
                        {matchedOrder.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#546A76]">Recipient</span>
                    <span className="font-medium text-[#0E171D]">{matchedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#546A76]">Destination</span>
                    <span className="font-medium text-[#0E171D]">{matchedOrder.city}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-[#546A76]">Payment Method</span>
                    <span className="font-medium text-[#0E171D]">{matchedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#DCEBEF] pt-3 font-display text-base font-bold text-[#0E171D]">
                    <span>Total Amount</span>
                    <span className="tabular-nums">{formatPkr(matchedOrder.totalPkr)}</span>
                  </div>
                  <p className="text-xs text-[#425561]">{matchedOrder.estimatedWindow}</p>
                </div>
              ) : (
                <p className="text-sm text-[#546A76]">
                  No parcel found for <strong className="text-[#0E171D]">{searchedId}</strong>. Please verify your Order ID or reach us on WhatsApp at {storeSettings.primaryPhone}.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-[#DCEBEF] bg-white p-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-[#118A9B]" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-[#0E171D]">
                  Simple 3-Step Delivery
                </h3>
              </div>
              <ol className="mt-4 space-y-4 text-sm text-[#425561]">
                <li>
                  <strong className="block font-display text-[#0E171D]">
                    01. Order Confirmation
                  </strong>
                  Instant Order ID generated with optional WhatsApp receipt verification.
                </li>
                <li>
                  <strong className="block font-display text-[#0E171D]">
                    02. Sealed Discreet Packing
                  </strong>
                  Packed in plain opaque bags with no outer garment descriptions.
                </li>
                <li>
                  <strong className="block font-display text-[#0E171D]">
                    03. Doorstep Cash on Delivery
                  </strong>
                  2–4 working days nationwide delivery across Pakistan.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
