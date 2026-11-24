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

export const PRODUCT_IMAGES = [
  'https://i.postimg.cc/gcDDr3Yj/Whats-App-Image-2026-11-21-at-2-22-24-PM.jpg',
  'https://i.postimg.cc/dQBBDGqD/Whats-App-Image-2026-11-21-at-2-22-36-PM.jpg',
  'https://i.postimg.cc/Wpnnt02d/Whats-App-Image-2026-11-21-at-2-22-42-PM.jpg',
  'https://i.postimg.cc/Wpnnt02D/Whats-App-Image-2026-11-21-at-2-22-46-PM.jpg',
  'https://i.postimg.cc/jqXXCysL/Whats-App-Image-2026-11-21-at-2-22-50-PM.jpg',
  'https://i.postimg.cc/VsRR5XYb/Whats-App-Image-2026-11-21-at-2-22-56-PM.jpg',
  'https://i.postimg.cc/Dfggm12G/Whats-App-Image-2026-11-21-at-2-23-02-PM.jpg',
  'https://i.postimg.cc/J7qqtj1k/Whats-App-Image-2026-11-21-at-2-23-08-PM.jpg',
  'https://i.postimg.cc/4455npJt/Whats-App-Image-2026-11-21-at-2-23-24-PM.jpg',
  'https://i.postimg.cc/5933j8xB/Whats-App-Image-2026-11-21-at-2-23-34-PM.jpg',
  'https://i.postimg.cc/pVZZyK2z/Whats-App-Image-2026-11-21-at-2-23-41-PM.jpg',
  'https://i.postimg.cc/6600TC9C/Whats-App-Image-2026-11-21-at-2-23-48-PM.jpg',
  'https://i.postimg.cc/G3QQ9vck/Whats-App-Image-2026-11-21-at-2-26-06-PM.jpg',
  'https://i.postimg.cc/Pf44N1tb/Whats-App-Image-2026-11-21-at-2-27-09-PM.jpg',
  'https://i.postimg.cc/ryJJz58C/Whats-App-Image-2026-11-21-at-2-27-47-PM.jpg',
  'https://i.postimg.cc/Wpnnt027/Whats-App-Image-2026-11-21-at-2-28-16-PM.jpg',
  'https://i.postimg.cc/QNbbVcXJ/Whats-App-Image-2026-11-21-at-2-29-42-PM.jpg',
  'https://i.postimg.cc/Wpnnt028/Whats-App-Image-2026-11-21-at-2-30-18-PM.jpg',
  'https://i.postimg.cc/RCRRqwMX/Whats-App-Image-2026-11-21-at-2-31-29-PM.jpg',
  'https://i.postimg.cc/Pf44N1tS/Whats-App-Image-2026-11-21-at-2-31-30-PM.jpg',
  'https://i.postimg.cc/jqXXCysk/Whats-App-Image-2026-11-21-at-2-31-31-PM.jpg',
  'https://i.postimg.cc/v8zzD5QP/Whats-App-Image-2026-11-21-at-2-31-31-PM-(1).jpg',
  'https://i.postimg.cc/wxVV3D6G/Whats-App-Image-2026-11-21-at-2-31-32-PM.jpg',
  'https://i.postimg.cc/Wpnnt02y/Whats-App-Image-2026-11-21-at-2-31-32-PM-(1).jpg',
  'https://i.postimg.cc/Kv85T4zN/Whats-App-Image-2026-11-21-at-2-31-33-PM.jpg',
  'https://i.postimg.cc/FFZZ109q/Whats-App-Image-2026-11-21-at-2-31-33-PM-(1).jpg',
  'https://i.postimg.cc/jqXXCysB/Whats-App-Image-2026-11-21-at-2-31-33-PM-(2).jpg',
  'https://i.postimg.cc/bNwRndJm/Whats-App-Image-2026-11-21-at-2-31-34-PM.jpg',
  'https://i.postimg.cc/Qxdq7Vtm/Whats-App-Image-2026-11-21-at-2-31-34-PM-(1).jpg',
  'https://i.postimg.cc/DywcGmZ5/Whats-App-Image-2026-11-21-at-2-31-34-PM-(2).jpg',
  'https://i.postimg.cc/RVZTtqFX/Whats-App-Image-2026-11-21-at-2-31-34-PM-(3).jpg',
  'https://i.postimg.cc/8Pzbvs5K/Whats-App-Image-2026-11-21-at-2-31-35-PM.jpg',
] as const;

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-high-necks',
    name: 'High-Necks & Tops',
    image: PRODUCT_IMAGES[1],
    subcategories: ['Ribbed High-Necks', 'Fleece Thermals', 'Mock-Neck Tees', 'Winter Pullovers'],
    sortOrder: 1,
  },
  {
    id: 'cat-innerwear',
    name: 'Everyday Innerwear',
    image: PRODUCT_IMAGES[4],
    subcategories: ['Wireless Bras', 'Contour Support', 'Bralettes', 'Cotton Briefs', 'Seamless Hipsters'],
    sortOrder: 2,
  },
  {
    id: 'cat-socks-hosiery',
    name: 'Socks & Hosiery',
    image: PRODUCT_IMAGES[9],
    subcategories: ['Thermal Socks', 'Ankle & No-Show', 'Fleece Leggings', 'Sheer Stockings'],
    sortOrder: 3,
  },
  {
    id: 'cat-shapewear',
    name: 'Shapewear',
    image: PRODUCT_IMAGES[15],
    subcategories: ['High-Waist Shorts', 'Bodysuits', 'Camisoles & Slips', 'Waist Trainers'],
    sortOrder: 4,
  },
  {
    id: 'cat-lounge-nightwear',
    name: 'Lounge & Nightwear',
    image: PRODUCT_IMAGES[20],
    subcategories: ['Cotton Co-Ords', 'Satin Sleepwear', 'Velour Winter Sets'],
    sortOrder: 5,
  },
  {
    id: 'cat-bridal-silk',
    name: 'Bridal & Silk',
    image: PRODUCT_IMAGES[27],
    subcategories: ['3-Piece Trousseau', 'Kimono Robes', 'Bridal Nightdresses'],
    sortOrder: 6,
  },
  {
    id: 'cat-shawls-scarves',
    name: 'Shawls & Hijabs',
    image: PRODUCT_IMAGES[12],
    subcategories: ['Soft Wool Shawls', 'Everyday Hijabs', 'Underscarf Caps'],
    sortOrder: 7,
  },
  {
    id: 'cat-accessories',
    name: 'Care & Accessories',
    image: PRODUCT_IMAGES[21],
    subcategories: ['Laundry Pouches', 'Comfort Extenders', 'Silk Sleep Masks'],
    sortOrder: 8,
  },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: "K&SON'S COLLECTION'S",
    title: 'EVERYDAY GARMENTS & INNERWEAR',
    subtitle: 'Breathable comfort with free discreet delivery across Pakistan.',
    ctaLabel: 'Shop Now',
    targetCategory: 'All',
    image: PRODUCT_IMAGES[0],
  },
  {
    id: 'slide-2',
    eyebrow: 'WINTER & LAYERED EDIT',
    title: 'SOFT HIGH-NECKS & ESSENTIALS',
    subtitle: 'Stretch comfort crafted for everyday winter wear.',
    ctaLabel: 'Explore Collection',
    targetCategory: 'High-Necks & Tops',
    image: PRODUCT_IMAGES[3],
  },
  {
    id: 'slide-3',
    eyebrow: 'LOUNGE & BRIDAL',
    title: 'SATIN LOUNGE & COZY HOSIERY',
    subtitle: '100% Free nationwide delivery on every order.',
    ctaLabel: 'View Loungewear',
    targetCategory: 'Lounge & Nightwear',
    image: PRODUCT_IMAGES[18],
  },
  {
    id: 'slide-4',
    eyebrow: 'SEAMLESS CONFIDENCE',
    title: 'SHAPEWEAR & SUPPORT SERIES',
    subtitle: 'Smooth under-outfit contouring with breathable control.',
    ctaLabel: 'Shop Shapewear',
    targetCategory: 'Shapewear',
    image: PRODUCT_IMAGES[15],
  },
  {
    id: 'slide-5',
    eyebrow: 'TROUSSEAU & SILK',
    title: 'BRIDAL NIGHTWEAR & ROBE SETS',
    subtitle: 'Lustre satin and delicate lace delivered in privacy parcels.',
    ctaLabel: 'Explore Bridal',
    targetCategory: 'Bridal & Silk',
    image: PRODUCT_IMAGES[27],
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'ks-01-ribbed-highneck',
    name: 'AeroRib Soft Stretch High-Neck Top',
    category: 'High-Necks & Tops',
    subcategory: 'Ribbed High-Necks',
    series: 'Winter Essentials',
    pricePkr: 1650,
    compareAtPkr: 1950,
    image: PRODUCT_IMAGES[0],
    gallery: [PRODUCT_IMAGES[0], PRODUCT_IMAGES[1], PRODUCT_IMAGES[2]],
    fabric: '92% Combed Cotton Rib · 8% Elastane',
    description:
      'Fine-gauge stretchable high-neck top designed for effortless daily layering under jackets, shawls, and lawn or khaddar outfits without losing neckline shape.',
    highlights: [
      'Breathable soft-brushed inner finish',
      'Non-bulky collar that stays crisp all day',
      'Discreet sealed parcel packaging',
    ],
    careInstructions: ['Cold gentle machine or hand wash', 'Dry flat in shade', 'Steam lightly on low heat'],
    availability: 'Best Seller',
    featured: true,
  },
  {
    id: 'ks-02-thermal-highneck',
    name: 'VelvetTouch Fleece-Lined High-Neck',
    category: 'High-Necks & Tops',
    subcategory: 'Fleece Thermals',
    series: 'Winter Essentials',
    pricePkr: 1950,
    compareAtPkr: 2300,
    image: PRODUCT_IMAGES[1],
    gallery: [PRODUCT_IMAGES[1], PRODUCT_IMAGES[3], PRODUCT_IMAGES[0]],
    fabric: '85% Micro-Fleece Viscose · 15% Spandex',
    description:
      'Insulated micro-fleece interior retains gentle warmth while keeping an ultra-slim outer profile for cold mornings and evening travel.',
    highlights: [
      'Velvet-soft thermal lining against skin',
      'Four-way comfort stretch sleeves',
      'Cash on Delivery available nationwide',
    ],
    careInstructions: ['Wash inside-out in cold water', 'Do not bleach', 'Line dry naturally'],
    availability: 'New Arrival',
    featured: true,
  },
  {
    id: 'ks-03-mockneck-fitted',
    name: 'Classic Modal Mock-Neck Layering Tee',
    category: 'High-Necks & Tops',
    subcategory: 'Mock-Neck Tees',
    series: 'Everyday Layers',
    pricePkr: 1450,
    image: PRODUCT_IMAGES[2],
    gallery: [PRODUCT_IMAGES[2], PRODUCT_IMAGES[0]],
    fabric: '95% Micro-Modal · 5% Lycra',
    description:
      'Lightweight all-season mock-neck blouse with silky drape and zero static cling, crafted for modest layering and crisp office style.',
    highlights: [
      'Cool-touch breathable modal knit',
      'Smooth shoulder seams with zero chafing',
      'Easy everyday wash and quick dry',
    ],
    careInstructions: ['Gentle cold wash', 'Do not wring', 'Hang dry on padded hanger'],
    availability: 'In Stock',
  },
  {
    id: 'ks-04-seamless-bra',
    name: 'CloudWeave Wireless Seamless Comfort Bra',
    category: 'Everyday Innerwear',
    subcategory: 'Wireless Bras',
    series: 'CloudWeave Series',
    pricePkr: 1850,
    compareAtPkr: 2200,
    image: PRODUCT_IMAGES[3],
    gallery: [PRODUCT_IMAGES[3], PRODUCT_IMAGES[4], PRODUCT_IMAGES[5]],
    fabric: '78% Micro-Modal · 22% Lycra Elastane',
    description:
      'Wire-free bonded construction built for invisible support beneath fitted kurtas and tees with wide cushioned straps that never dig in.',
    highlights: [
      'Zero underwire irritation for 12-hour wear',
      'Perforated breathable inner lining',
      'Plain unmarked outer parcel for privacy',
    ],
    careInstructions: ['Hand wash cold or use laundry pouch', 'Do not bleach', 'Dry flat away from sun'],
    availability: 'Best Seller',
    featured: true,
  },
  {
    id: 'ks-05-contour-support',
    name: 'Dilkash Scalloped Lace Contour Support Bra',
    category: 'Everyday Innerwear',
    subcategory: 'Contour Support',
    series: 'Signature Support',
    pricePkr: 2150,
    image: PRODUCT_IMAGES[4],
    gallery: [PRODUCT_IMAGES[4], PRODUCT_IMAGES[6]],
    fabric: '82% Combed Cotton · 18% Stretch Lace',
    description:
      'Lightly contoured everyday design combining breathable cotton inner cups with delicate floral lace edging and wide stabilizing side wings.',
    highlights: [
      'Sweat-wicking cotton inner cup lining',
      'Full coverage posture-friendly band',
      'Soft hook-and-eye back closure',
    ],
    careInstructions: ['Cold gentle hand wash', 'Reshape cups while damp', 'Air dry in shade'],
    availability: 'In Stock',
    featured: true,
  },
  {
    id: 'ks-06-ribbed-bralette',
    name: 'MotionFlex Seamless Lounge Bralette',
    category: 'Everyday Innerwear',
    subcategory: 'Bralettes',
    series: 'Active Essentials',
    pricePkr: 1550,
    image: PRODUCT_IMAGES[5],
    gallery: [PRODUCT_IMAGES[5], PRODUCT_IMAGES[7]],
    fabric: '90% Organic Cotton Rib · 10% Spandex',
    description:
      'Pull-on ribbed support bralette with zero metal clasps, ideal for home relaxation, light yoga, sleep, and long travel days.',
    highlights: [
      'Hardware-free comfort design',
      'Wide ribbed underband stays put',
      'Ultra-breathable cotton blend',
    ],
    careInstructions: ['Machine wash cold', 'Tumble dry low or air dry', 'Do not iron'],
    availability: 'In Stock',
  },
  {
    id: 'ks-07-cotton-brief-trio',
    name: 'PureCombed Everyday Briefs (Value Pack)',
    category: 'Everyday Innerwear',
    subcategory: 'Cotton Briefs',
    series: 'Daily Essentials',
    pricePkr: 1450,
    compareAtPkr: 1750,
    image: PRODUCT_IMAGES[6],
    gallery: [PRODUCT_IMAGES[6], PRODUCT_IMAGES[8]],
    fabric: '95% Long-Staple Cotton · 5% Elastane',
    description:
      'Breathable multi-piece everyday cotton pack featuring tag-free printing and flatlock waistbands that sit smoothly without rolling.',
    highlights: [
      '100% breathable cotton gusset',
      'Soft no-pinch leg elastics',
      'Sealed hygienic multi-pack',
    ],
    careInstructions: ['Machine wash warm or cold', 'Avoid heavy fabric softeners', 'Line dry'],
    availability: 'Best Seller',
  },
  {
    id: 'ks-08-laser-hipsters',
    name: 'ZeroLine Laser-Cut Seamless Hipster Pack',
    category: 'Everyday Innerwear',
    subcategory: 'Seamless Hipsters',
    series: 'CloudWeave Series',
    pricePkr: 1750,
    image: PRODUCT_IMAGES[7],
    gallery: [PRODUCT_IMAGES[7], PRODUCT_IMAGES[6]],
    fabric: '76% Cooling Polyamide · 24% Elastane',
    description:
      'Ultra-thin laser-cut edges melt flat against skin so nothing shows under formal trousers, silk dresses, or tailored lawn suits.',
    highlights: [
      'Zero visible panty lines',
      'Quick-dry silk-touch cooling fabric',
      'Featherweight second-skin feel',
    ],
    careInstructions: ['Cold wash in delicate bag', 'Do not iron bonded seams', 'Hang dry'],
    availability: 'New Arrival',
  },
  {
    id: 'ks-09-velvet-socks-pack',
    name: 'Plush Thermal Winter Socks (Combo Set)',
    category: 'Socks & Hosiery',
    subcategory: 'Thermal Socks',
    series: 'Cozy Footcare',
    pricePkr: 950,
    compareAtPkr: 1200,
    image: PRODUCT_IMAGES[8],
    gallery: [PRODUCT_IMAGES[8], PRODUCT_IMAGES[9], PRODUCT_IMAGES[10]],
    fabric: '88% Combed Wool-Cotton · 12% Nylon Stretch',
    description:
      'Cushioned winter crew socks engineered to trap warmth comfortably inside boots, sneakers, or indoor slippers without sweating.',
    highlights: [
      'Reinforced heel and toe stitching',
      'Soft non-binding ankle cuff',
      'Ideal for winter travel & home',
    ],
    careInstructions: ['Machine wash cold', 'Do not bleach', 'Dry naturally'],
    availability: 'Best Seller',
    featured: true,
  },
  {
    id: 'ks-10-ankle-socks',
    name: 'Breathable Cotton No-Show & Ankle Socks',
    category: 'Socks & Hosiery',
    subcategory: 'Ankle & No-Show',
    series: 'Daily Footcare',
    pricePkr: 850,
    image: PRODUCT_IMAGES[9],
    gallery: [PRODUCT_IMAGES[9], PRODUCT_IMAGES[11]],
    fabric: '90% Combed Cotton · 10% Spandex',
    description:
      'Everyday low-profile cotton socks with silicone heel grip so they never slip down inside flats, loafers, or athletic trainers.',
    highlights: [
      'Anti-slip inner heel tab',
      'Moisture-wicking arch support',
      'Smooth toe seam finish',
    ],
    careInstructions: ['Cold or warm wash', 'Tumble dry low', 'Do not dry clean'],
    availability: 'In Stock',
  },
  {
    id: 'ks-11-fleece-tights',
    name: 'ThermoSheer Fleece-Lined Winter Leggings',
    category: 'Socks & Hosiery',
    subcategory: 'Fleece Leggings',
    series: 'Winter Essentials',
    pricePkr: 1850,
    compareAtPkr: 2150,
    image: PRODUCT_IMAGES[10],
    gallery: [PRODUCT_IMAGES[10], PRODUCT_IMAGES[12]],
    fabric: '80% Thermal Polyamide · 20% Elastane',
    description:
      'Opaque stretch winter tights with cozy brushed inner lining and high-rise comfort waistband for dresses, tunics, and long coats.',
    highlights: [
      'Snag-resistant matte exterior',
      'Plush inner warmth without bulk',
      'Wide anti-roll waist support',
    ],
    careInstructions: ['Hand wash cold', 'Hang dry away from heaters', 'Do not iron'],
    availability: 'New Arrival',
    featured: true,
  },
  {
    id: 'ks-12-knee-high-hosiery',
    name: 'SilkSheer Everyday Stockings & Knee-Highs',
    category: 'Socks & Hosiery',
    subcategory: 'Sheer Stockings',
    series: 'Hosiery Studio',
    pricePkr: 780,
    image: PRODUCT_IMAGES[11],
    gallery: [PRODUCT_IMAGES[11], PRODUCT_IMAGES[10]],
    fabric: '85% Micro-Nylon · 15% Lycra',
    description:
      'Smooth matte-finish sheer hosiery crafted for breathable evening and formal wear with reinforced comfort toes.',
    highlights: [
      'Silky even-tone matte finish',
      'Comfortable stay-up top band',
      'Lightweight and snag-resistant',
    ],
    careInstructions: ['Gentle hand wash in cool water', 'Air dry flat', 'Keep away from sharp jewelry'],
    availability: 'In Stock',
  },
  {
    id: 'ks-13-winter-knit-top',
    name: 'AuraKnit Slim-Fit Everyday Pullover',
    category: 'High-Necks & Tops',
    subcategory: 'Winter Pullovers',
    series: 'Winter Essentials',
    pricePkr: 2100,
    image: PRODUCT_IMAGES[12],
    gallery: [PRODUCT_IMAGES[12], PRODUCT_IMAGES[13], PRODUCT_IMAGES[14]],
    fabric: '70% Viscose Knit · 30% Stretch Polyamide',
    description:
      'Polished fine-ribbed pullover sweater top that pairs smoothly with tailored trousers, skirts, or winter outerwear.',
    highlights: [
      'Soft pilling-resistant knit',
      'Flattering elongated cuff detail',
      'Breathable medium-weight warmth',
    ],
    careInstructions: ['Cold hand wash', 'Fold to dry flat', 'Do not hang wet'],
    availability: 'New Arrival',
  },
  {
    id: 'ks-14-thermal-camisole',
    name: 'HeatLock Seamless Thermal Inner Top',
    category: 'High-Necks & Tops',
    subcategory: 'Fleece Thermals',
    series: 'Thermal Care',
    pricePkr: 1550,
    image: PRODUCT_IMAGES[13],
    gallery: [PRODUCT_IMAGES[13], PRODUCT_IMAGES[14]],
    fabric: '88% Thermal Modal · 12% Elastane',
    description:
      'Invisible warmth base-layer top designed to fit smoothly under winter formals and bridal wear without adding sleeve bulk.',
    highlights: [
      'Seamless sides for zero lines',
      'Retains natural body warmth',
      'Breathable sweat-free fiber',
    ],
    careInstructions: ['Gentle cold wash', 'Air dry', 'Do not iron'],
    availability: 'In Stock',
  },
  {
    id: 'ks-15-sculpt-highwaist',
    name: 'SculptCore High-Waist Shaping Short',
    category: 'Shapewear',
    subcategory: 'High-Waist Shorts',
    series: 'Silhouette Control',
    pricePkr: 2450,
    compareAtPkr: 2850,
    image: PRODUCT_IMAGES[14],
    gallery: [PRODUCT_IMAGES[14], PRODUCT_IMAGES[15], PRODUCT_IMAGES[16]],
    fabric: '72% Micro-Nylon · 28% High-Recovery Spandex',
    description:
      'Targeted tummy and thigh-smoothing shaper built with an anti-roll ribbed waistband that stays secure while sitting or walking.',
    highlights: [
      'Smooths midsection & prevents chafing',
      'Breathable zoned compression knit',
      'Invisible under sarees & formal wear',
    ],
    careInstructions: ['Hand wash cold after wear', 'Press in towel, never wring', 'Dry flat'],
    availability: 'Best Seller',
    featured: true,
  },
  {
    id: 'ks-16-shaping-bodysuit',
    name: 'FormFit Seamless Shaping Bodysuit',
    category: 'Shapewear',
    subcategory: 'Bodysuits',
    series: 'Silhouette Control',
    pricePkr: 3250,
    compareAtPkr: 3700,
    image: PRODUCT_IMAGES[15],
    gallery: [PRODUCT_IMAGES[15], PRODUCT_IMAGES[17]],
    fabric: '74% Micro-Nylon · 26% Elastane',
    description:
      'All-in-one smoothing bodysuit with adjustable straps and a convenient 3-snap cotton gusset for effortless all-day confidence.',
    highlights: [
      'Graduated 360-degree core smoothing',
      'Flexible unpadded bust zone',
      'Convertible strap hooks',
    ],
    careInstructions: ['Fasten snaps before washing', 'Gentle cold wash', 'Dry flat'],
    availability: 'New Arrival',
  },
  {
    id: 'ks-17-lace-camisole',
    name: 'SilkyTrim Modal Camisole & Slip',
    category: 'Shapewear',
    subcategory: 'Camisoles & Slips',
    series: 'Everyday Layers',
    pricePkr: 1350,
    image: PRODUCT_IMAGES[16],
    gallery: [PRODUCT_IMAGES[16], PRODUCT_IMAGES[18]],
    fabric: '94% Micro-Modal · 6% Lace Trim',
    description:
      'Soft breathable inner camisole slip finished with delicate neckline trim for comfortable coverage beneath sheer fabrics.',
    highlights: [
      'Adjustable satin-finish straps',
      'Anti-static modal drape',
      'Tag-free smooth neck label',
    ],
    careInstructions: ['Cold wash inside laundry bag', 'Line dry', 'Low steam if needed'],
    availability: 'In Stock',
  },
  {
    id: 'ks-18-waist-trainer-belt',
    name: 'FlexPosture Breathable Waist Cinch',
    category: 'Shapewear',
    subcategory: 'Waist Trainers',
    series: 'Silhouette Control',
    pricePkr: 2650,
    image: PRODUCT_IMAGES[17],
    gallery: [PRODUCT_IMAGES[17], PRODUCT_IMAGES[15]],
    fabric: '80% Perforated Neoprene-Free Mesh · 20% Spandex',
    description:
      'Lightweight breathable waist trainer with soft flexible boning for gentle posture support and waist definition.',
    highlights: [
      'Air-vented latex-free mesh',
      'Triple-row adjustable hook columns',
      'Flexible movement while seated',
    ],
    careInstructions: ['Wipe clean or cold hand wash', 'Air dry flat', 'Do not tumble dry'],
    availability: 'In Stock',
  },
  {
    id: 'ks-19-cotton-lounge-set',
    name: 'CloudCotton 2-Piece Relaxed Lounge Set',
    category: 'Lounge & Nightwear',
    subcategory: 'Cotton Co-Ords',
    series: 'Evening Calm',
    pricePkr: 2850,
    compareAtPkr: 3300,
    image: PRODUCT_IMAGES[18],
    gallery: [PRODUCT_IMAGES[18], PRODUCT_IMAGES[19], PRODUCT_IMAGES[20]],
    fabric: '96% Combed Jersey Cotton · 4% Spandex',
    description:
      'Soft breathable tee and drawstring relaxed trouser co-ord set built for peaceful sleep and effortless mornings at home.',
    highlights: [
      'Deep side trouser pockets',
      'Soft covered elastic waistband',
      'Pre-shrunk combed cotton jersey',
    ],
    careInstructions: ['Machine wash cold', 'Tumble dry low', 'Warm iron if needed'],
    availability: 'Best Seller',
    featured: true,
  },
  {
    id: 'ks-20-satin-sleep-set',
    name: 'SatinMist Piped 2-Piece Sleepwear Set',
    category: 'Lounge & Nightwear',
    subcategory: 'Satin Sleepwear',
    series: 'Evening Calm',
    pricePkr: 3650,
    image: PRODUCT_IMAGES[19],
    gallery: [PRODUCT_IMAGES[19], PRODUCT_IMAGES[21], PRODUCT_IMAGES[22]],
    fabric: '96% Matte Silk-Touch Satin · 4% Spandex',
    description:
      'Cool-touch satin sleepwear finished with tailored contrast piping for breathable luxury night after night.',
    highlights: [
      'Cooling drape against skin',
      'Relaxed button-front styling',
      'Gift-ready sealed presentation',
    ],
    careInstructions: ['Wash inside-out in cold water', 'Steam lightly on low', 'Hang dry'],
    availability: 'New Arrival',
  },
  {
    id: 'ks-21-cozy-home-coords',
    name: 'VelourSoft Winter Home Co-Ord Set',
    category: 'Lounge & Nightwear',
    subcategory: 'Velour Winter Sets',
    series: 'Evening Calm',
    pricePkr: 3450,
    image: PRODUCT_IMAGES[20],
    gallery: [PRODUCT_IMAGES[20], PRODUCT_IMAGES[23]],
    fabric: '92% Plush Velour · 8% Elastane',
    description:
      'Ultra-plush cozy loungewear set engineered to keep winter evenings warm while feeling weightless and soft.',
    highlights: [
      'Double-brushed velour softness',
      'Relaxed ribbed cuffs & waist',
      'Fade-resistant rich dye finish',
    ],
    careInstructions: ['Cold gentle wash', 'Do not bleach', 'Dry flat or low tumble'],
    availability: 'In Stock',
  },
  {
    id: 'ks-22-bridal-satin-robe',
    name: 'Noor Bridal 3-Piece Satin & Lace Set',
    category: 'Bridal & Silk',
    subcategory: '3-Piece Trousseau',
    series: 'Bridal Atelier',
    pricePkr: 4800,
    compareAtPkr: 5500,
    image: PRODUCT_IMAGES[24],
    gallery: [PRODUCT_IMAGES[24], PRODUCT_IMAGES[25], PRODUCT_IMAGES[26], PRODUCT_IMAGES[27]],
    fabric: '92% Lustre Satin · 8% Chantilly Lace Trim',
    description:
      'Curated bridal trousseau gift set featuring a lace-trimmed slip gown, matching wrap robe with satin tie belt, and soft sleep mask.',
    highlights: [
      'Fine Chantilly floral lace trim',
      'Adjustable inner & outer waist ties',
      'Gift-boxed discreet shipping',
    ],
    careInstructions: ['Delicate cold hand wash', 'Keep lace clear of zippers', 'Store folded in pouch'],
    availability: 'Best Seller',
    featured: true,
  },
  {
    id: 'ks-23-lace-kimono-nightwear',
    name: 'Elysian Silk-Touch Lace Kimono Robe Set',
    category: 'Bridal & Silk',
    subcategory: 'Kimono Robes',
    series: 'Bridal Atelier',
    pricePkr: 4250,
    image: PRODUCT_IMAGES[28],
    gallery: [PRODUCT_IMAGES[28], PRODUCT_IMAGES[29], PRODUCT_IMAGES[30]],
    fabric: '95% Silk-Touch Satin · 5% Lace Trim',
    description:
      'Flowing kimono sleeves paired with delicate scalloped lace cuffs and matching inner sleepwear for bridal gifting and special evenings.',
    highlights: [
      'Breathable modal-lined lace edges',
      'Lustrous wrinkle-resistant satin',
      'Nationwide Cash on Delivery',
    ],
    careInstructions: ['Hand wash cold', 'Low steam press', 'Hang on padded hanger'],
    availability: 'New Arrival',
  },
  {
    id: 'ks-24-luxury-trousseau-edit',
    name: 'Dilkash Signature Bridal Nightdress Edit',
    category: 'Bridal & Silk',
    subcategory: 'Bridal Nightdresses',
    series: 'Bridal Atelier',
    pricePkr: 3950,
    compareAtPkr: 4500,
    image: PRODUCT_IMAGES[31],
    gallery: [PRODUCT_IMAGES[31], PRODUCT_IMAGES[22], PRODUCT_IMAGES[23]],
    fabric: '94% Soft Satin · 6% Sheer Mesh Lace',
    description:
      'Signature evening and bridal nightdress featuring delicate pleated bodice detailing, adjustable shoulder straps, and fluid hem drape.',
    highlights: [
      'Tailored adjustable straps',
      'Skin-friendly soft inner seams',
      'Discreet unmarked parcel delivery',
    ],
    careInstructions: ['Cold hand wash with mild soap', 'Air dry in shade', 'Do not wring'],
    availability: 'In Stock',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'Ayesha Kamran',
    city: 'Lahore',
    productPurchased: 'CloudWeave Wireless Seamless Bra',
    quote:
      'Ordered three pieces and the parcel arrived in completely plain, sealed packaging. The fabric feels so soft and genuinely breathable.',
  },
  {
    id: 't-2',
    name: 'Hina Siddiqui',
    city: 'Karachi',
    productPurchased: 'AeroRib Soft Stretch High-Neck',
    quote:
      'The high-neck stretch quality is way better than regular market pieces and layers smoothly under winter coats.',
  },
  {
    id: 't-3',
    name: 'Mahnoor Raza',
    city: 'Islamabad',
    productPurchased: 'Noor Bridal 3-Piece Satin Set',
    quote:
      'Bought the bridal trousseau set for my sister. Satin finish and lace trim looked super neat with quick confirmation.',
  },
  {
    id: 't-4',
    name: 'Sana Farooq',
    city: 'Rawalpindi',
    productPurchased: 'Plush Thermal Winter Socks & Leggings',
    quote:
      'Fast Cash on Delivery within two days. The fleece-lined leggings and winter socks are warm without feeling heavy.',
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
      'Yes. Message 0315-5588282 or 0321-8026012 anytime for single orders or boutique bulk pricing.',
  },
];

export const QUALITY_PARTNERS = [
  { title: 'Combed Cotton', detail: 'Long-staple breathable fibers' },
  { title: 'CloudWeave Knit', detail: 'Seamless zero-line comfort' },
  { title: 'Thermal Rib', detail: 'Stretch winter insulation' },
  { title: 'Lustre Satin', detail: 'Cool-touch bridal drape' },
  { title: 'Privacy Sealed', detail: 'Plain opaque outer parcels' },
];

export const INITIAL_SAMPLE_ORDERS: OrderRecord[] = [
  {
    orderId: 'KS-2035',
    createdAt: '2026-11-20',
    customerName: 'Ayesha Tariq',
    phone: '0300-XXXX812',
    city: 'Lahore',
    address: 'DHA Phase 5, Lahore',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        productId: 'ks-04-seamless-bra',
        name: 'CloudWeave Wireless Seamless Comfort Bra',
        image: PRODUCT_IMAGES[3],
        quantity: 2,
        pricePkr: 1850,
      },
    ],
    subtotalPkr: 3700,
    deliveryPkr: 0,
    totalPkr: 3700,
    status: 'Out for Delivery',
    estimatedWindow: 'Arriving within 24 hours',
  },
];

export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}
