export type PaymentMethod =
  | 'Cash on Delivery'
  | 'Easypaisa'
  | 'JazzCash'
  | 'Online Bank Transfer';

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  subcategories: string[];
  sortOrder?: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  series?: string;
  pricePkr: number;
  compareAtPkr?: number;
  image: string;
  gallery: string[];
  fabric: string;
  description: string;
  highlights: string[];
  careInstructions: string[];
  sizes?: string[];
  colors?: ProductColor[];
  availability: 'In Stock' | 'New Arrival' | 'Best Seller' | 'Out of Stock';
  featured?: boolean;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  pricePkr: number;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  updatedAt?: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotalPkr: number;
  deliveryPkr: number;
  totalPkr: number;
  status:
    | 'Confirmed'
    | 'Discreetly Packed'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled';
  estimatedWindow: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  targetCategory: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  productPurchased: string;
  quote: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StoreSettings {
  brandName: string;
  shortMark: string;
  domain: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  instagramUrl: string;
  handle: string;
  tiktokUrl: string;
  tiktokHandle: string;
  facebookUrl: string;
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  easypaisaAccountTitle: string;
  easypaisaNumber: string;
  jazzcashEnabled: boolean;
  jazzcashAccountTitle: string;
  jazzcashNumber: string;
  bankEnabled: boolean;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
}

export const STORE_INFO = {
  brandName: "K&SON'S COLLECTION'S",
  shortMark: "K&SON'S",
  domain: 'ksons-collections.store',
  handle: '@ksonscollections',
  tiktokHandle: '@dilkash.undergarm',
  logoPath: '/assets/aistudio/WhatsApp_Image_2026-11-21_at_2.21.44_PM_9ee81bee.jpeg',
  email: 'Facezakir@gmail.com',
  primaryPhone: '03155588282',
  primaryPhoneFormatted: '0315-5588282',
  secondaryPhone: '03218026012',
  secondaryPhoneFormatted: '0321-8026012',
  instagramUrl: 'https://www.instagram.com/ksonscollections?lqvp=MTA4c2toY2EwNjNqag==',
  tiktokUrl: 'https://www.tiktok.com/@dilkash.undergarm?_r=1&_t=ZS-9BanzmoxiQm',
  facebookUrl: 'https://www.facebook.com/search/top?q=K%26SON%27S%20COLLECTION%27S',
  freeDeliveryThresholdPkr: 0,
  standardDeliveryPkr: 0,
} as const;

export const BANNER_IMAGES = {
  everyday: '/assets/banners/banner_everyday.jpg',
  winter: '/assets/banners/banner_winter.jpg',
  bridal: '/assets/banners/banner_bridal.jpg',
  packaging: '/assets/banners/banner_packaging.jpg',
} as const;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  brandName: STORE_INFO.brandName,
  shortMark: STORE_INFO.shortMark,
  domain: STORE_INFO.domain,
  email: STORE_INFO.email,
  primaryPhone: STORE_INFO.primaryPhoneFormatted,
  secondaryPhone: STORE_INFO.secondaryPhoneFormatted,
  instagramUrl: STORE_INFO.instagramUrl,
  handle: STORE_INFO.handle,
  tiktokUrl: STORE_INFO.tiktokUrl,
  tiktokHandle: STORE_INFO.tiktokHandle,
  facebookUrl: STORE_INFO.facebookUrl,
  codEnabled: true,
  easypaisaEnabled: true,
  easypaisaAccountTitle: "K&SON'S COLLECTION'S",
  easypaisaNumber: STORE_INFO.primaryPhoneFormatted,
  jazzcashEnabled: true,
  jazzcashAccountTitle: "K&SON'S COLLECTION'S",
  jazzcashNumber: STORE_INFO.secondaryPhoneFormatted,
  bankEnabled: true,
  bankName: 'Meezan Bank / IBFT',
  bankAccountTitle: "K&SON'S COLLECTION'S",
  bankAccountNumber: 'Contact on WhatsApp for IBAN',
  bankIban: '',
};

export function toWhatsAppDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return `92${digits}`;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: "K&SON'S COLLECTION'S",
    title: 'EVERYDAY GARMENTS & INNERWEAR',
    subtitle: 'Breathable comfort with free discreet delivery across Pakistan.',
    ctaLabel: 'Shop Now',
    targetCategory: 'All',
    image: BANNER_IMAGES.everyday,
  },
  {
    id: 'slide-2',
    eyebrow: 'WINTER & LAYERED EDIT',
    title: 'SOFT HIGH-NECKS & ESSENTIALS',
    subtitle: 'Stretch comfort crafted for everyday winter wear.',
    ctaLabel: 'Explore Collection',
    targetCategory: 'All',
    image: BANNER_IMAGES.winter,
  },
  {
    id: 'slide-3',
    eyebrow: 'TROUSSEAU & SILK',
    title: 'BRIDAL SATIN & LOUNGEWEAR SETS',
    subtitle: 'Lustre satin and delicate finishes shipped in privacy parcels.',
    ctaLabel: 'View Categories',
    targetCategory: 'All',
    image: BANNER_IMAGES.bridal,
  },
  {
    id: 'slide-4',
    eyebrow: 'NATIONWIDE FREE SHIPPING',
    title: 'DISCREET SEALED DELIVERY',
    subtitle: '100% Free nationwide delivery on every order.',
    ctaLabel: 'Browse Store',
    targetCategory: 'All',
    image: BANNER_IMAGES.packaging,
  },
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [];
export const DEFAULT_PRODUCTS: Product[] = [];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Ayesha Kamran',
    city: 'Lahore',
    productPurchased: 'Seamless Comfort Collection',
    quote:
      'Ordered three pieces and the parcel arrived in completely plain, sealed packaging. The fabric feels so soft and genuinely breathable.',
  },
  {
    id: 't-2',
    name: 'Hina Siddiqui',
    city: 'Karachi',
    productPurchased: 'Stretch High-Neck Edit',
    quote:
      'The high-neck stretch quality is way better than regular market pieces and layers smoothly under winter coats.',
  },
  {
    id: 't-3',
    name: 'Mahnoor Raza',
    city: 'Islamabad',
    productPurchased: 'Bridal Satin Set',
    quote:
      'Bought the bridal trousseau set for my sister. Satin finish and lace trim looked super neat with quick confirmation.',
  },
  {
    id: 't-4',
    name: 'Sana Farooq',
    city: 'Rawalpindi',
    productPurchased: 'Thermal Winter Essentials',
    quote:
      'Fast free Cash on Delivery within two days. The fleece-lined pieces are warm without feeling heavy.',
  },
];

export const FAQS: FaqItem[] = [
  {
    question: 'Is my parcel delivered in discreet, private packaging?',
    answer:
      'Yes, 100%. Every order from ksons-collections.store is sealed inside plain, opaque packaging with zero product descriptions on the outer courier label.',
  },
  {
    question: 'Which payment methods do you support?',
    answer:
      'We accept Cash on Delivery, Easypaisa, JazzCash, and Online Bank Transfer across Pakistan.',
  },
  {
    question: 'Do you offer free shipping?',
    answer:
      'Yes! We offer 100% FREE nationwide discreet delivery on every order across Pakistan with zero hidden delivery charges.',
  },
  {
    question: 'Can I order directly on WhatsApp or inquire for wholesale?',
    answer:
      'Yes. Reach out on our official WhatsApp or phone numbers anytime for single orders or boutique bulk pricing.',
  },
];

export const QUALITY_PARTNERS = [
  { title: 'Combed Cotton', detail: 'Long-staple breathable fibers' },
  { title: 'CloudWeave Knit', detail: 'Seamless zero-line comfort' },
  { title: 'Thermal Rib', detail: 'Stretch winter insulation' },
  { title: 'Lustre Satin', detail: 'Cool-touch bridal drape' },
  { title: 'Privacy Sealed', detail: 'Plain opaque outer parcels' },
];

export const INITIAL_SAMPLE_ORDERS: OrderRecord[] = [];

export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}
