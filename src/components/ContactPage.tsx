import React, { useState } from 'react';
import {
  CheckCircle2,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Video,
} from 'lucide-react';
import {
  BANNER_IMAGES,
  StoreSettings,
  toWhatsAppDigits,
} from '../data/catalog';
import { ProductImage } from './ProductImage';

interface ContactPageProps {
  storeSettings: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ storeSettings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<'Retail Support' | 'Wholesale / Boutique'>('Retail Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const waDigits = toWhatsAppDigits(storeSettings.primaryPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  const whatsappDirectMsg = encodeURIComponent(
    `Assalam-o-Alaikum ${storeSettings.brandName} (${inquiryType})\nName: ${name || 'Customer'}\nPhone: ${phone || 'N/A'}\nMessage: ${message || 'I would like product details and pricing.'}`
  );

  return (
    <div className="bg-[#F5FAFB]">
      {/* Compact Full-Width Contact Banner */}
      <section className="relative w-full overflow-hidden bg-[#09181D]">
        <div className="relative min-h-[200px] w-full sm:min-h-[240px]">
          <ProductImage
            src={BANNER_IMAGES.everyday}
            alt={`Contact ${storeSettings.brandName}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
          <div className="relative z-10 mx-auto flex min-h-[200px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[240px] sm:px-6 lg:px-8">
            <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
              Customer &amp; Wholesale Desk
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
              Contact Us
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Direct Channels */}
          <div className="space-y-3 lg:col-span-5">
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] items-center justify-between rounded-xl border border-[#DCEBEF] bg-white px-4 py-3 transition-colors hover:border-[#118A9B]"
            >
              <div className="flex items-center gap-3.5">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-lg text-white">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[#546A76]">Primary WhatsApp &amp; Call</p>
                  <p className="font-display text-sm font-bold text-[#0E171D] tabular-nums">
                    {storeSettings.primaryPhone}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#118A9B]">Message</span>
            </a>

            <a
              href={`tel:${storeSettings.secondaryPhone.replace(/[^+\d]/g, '')}`}
              className="flex min-h-[56px] items-center justify-between rounded-xl border border-[#DCEBEF] bg-white px-4 py-3 transition-colors hover:border-[#118A9B]"
            >
              <div className="flex items-center gap-3.5">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-lg text-white">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[#546A76]">Secondary Phone &amp; WhatsApp</p>
                  <p className="font-display text-sm font-bold text-[#0E171D] tabular-nums">
                    {storeSettings.secondaryPhone}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#118A9B]">Call Now</span>
            </a>

            <a
              href={`mailto:${storeSettings.email}`}
              className="flex min-h-[56px] items-center justify-between rounded-xl border border-[#DCEBEF] bg-white px-4 py-3 transition-colors hover:border-[#118A9B]"
            >
              <div className="flex items-center gap-3.5">
                <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-lg text-white">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[#546A76]">Official Email</p>
                  <p className="font-display text-sm font-bold text-[#0E171D]">
                    {storeSettings.email}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#118A9B]">Email</span>
            </a>

            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
              {storeSettings.instagramUrl && (
                <a
                  href={storeSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#DCEBEF] bg-white px-3 py-2.5 text-xs font-semibold text-[#0E171D] transition-colors hover:border-[#118A9B]"
                >
                  <Instagram className="h-4 w-4 text-[#118A9B]" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
              )}
              {storeSettings.facebookUrl && (
                <a
                  href={storeSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#DCEBEF] bg-white px-3 py-2.5 text-xs font-semibold text-[#0E171D] transition-colors hover:border-[#118A9B]"
                >
                  <Facebook className="h-4 w-4 text-[#118A9B]" aria-hidden="true" />
                  <span>Facebook</span>
                </a>
              )}
              {storeSettings.tiktokUrl && (
                <a
                  href={storeSettings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#DCEBEF] bg-white px-3 py-2.5 text-xs font-semibold text-[#0E171D] transition-colors hover:border-[#118A9B]"
                >
                  <Video className="h-4 w-4 text-[#118A9B]" aria-hidden="true" />
                  <span>TikTok</span>
                </a>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:p-8 lg:col-span-7">
            <h2 className="font-display text-xl font-extrabold text-[#0E171D] uppercase">
              Send a Direct Inquiry
            </h2>
            <p className="mt-1.5 text-sm text-[#425561]">
              Ask about product stock, bulk wholesale pricing, or custom delivery requests.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-xl border border-[#BCE3E8] bg-[#EEF8F9] p-6">
                <div className="flex items-center gap-2.5 text-[#0D7280]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <p className="font-display text-base font-semibold">
                    Message Ready for {name}
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#334550]">
                  Send your inquiry directly to our WhatsApp desk or email for an instant reply.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${waDigits}?text=${whatsappDirectMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#1EB7CA] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Send via WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${storeSettings.email}?subject=${encodeURIComponent(
                      `${storeSettings.shortMark} ${inquiryType} - ${name}`
                    )}&body=${whatsappDirectMsg}`}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#D4E3E7] bg-white px-4 py-2 text-sm font-medium text-[#0E171D] hover:bg-[#F5FAFB]"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>Open Email Draft</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setPhone('');
                      setMessage('');
                    }}
                    className="min-h-[42px] px-3 text-xs font-semibold text-[#546A76] underline underline-offset-2 cursor-pointer"
                  >
                    New Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="page-contact-name"
                      className="block text-xs font-semibold text-[#0E171D]"
                    >
                      Your Name
                    </label>
                    <input
                      id="page-contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1.5 w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2.5 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="page-contact-phone"
                      className="block text-xs font-semibold text-[#0E171D]"
                    >
                      Phone / WhatsApp
                    </label>
                    <input
                      id="page-contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="mt-1.5 w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2.5 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#0E171D]">
                    Inquiry Type
                  </span>
                  <div className="mt-2 inline-flex rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] p-1">
                    {(['Retail Support', 'Wholesale / Boutique'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInquiryType(type)}
                        className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          inquiryType === type
                            ? 'bg-white text-[#0E171D] shadow-xs'
                            : 'text-[#546A76] hover:text-[#0E171D]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="page-contact-msg"
                    className="block text-xs font-semibold text-[#0E171D]"
                  >
                    Message
                  </label>
                  <textarea
                    id="page-contact-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about stock, delivery times, or wholesale quantities..."
                    className="mt-1.5 w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2.5 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#1EB7CA] px-6 py-2.5 font-display text-sm font-semibold text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>Prepare Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
