import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from 'lucide-react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  BANNER_IMAGES,
  CategoryItem,
  DEFAULT_STORE_SETTINGS,
  FAQS,
  OrderRecord,
  Product,
  QUALITY_PARTNERS,
  StoreSettings,
  TESTIMONIALS,
  toWhatsAppDigits,
} from './data/catalog';
import {
  OperationType,
  db,
  handleFirestoreError,
  testFirestoreConnection,
} from './lib/firebase';
import { AppPage, Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductImage } from './components/ProductImage';
import { SingleProductPage } from './components/SingleProductPage';
import { AboutPage } from './components/AboutPage';
import { CategoriesPage } from './components/CategoriesPage';
import { TrackOrderPage } from './components/TrackOrderPage';
import { ContactPage } from './components/ContactPage';
import { CheckoutPage } from './components/CheckoutPage';
import { AdminPage } from './components/AdminPage';
import { CartDrawer, CartEntry } from './components/CartDrawer';
import { BrandLogo } from './components/BrandLogo';
import { Footer } from './components/Footer';
import { PointerGlow } from './components/PointerGlow';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

const BAG_STORAGE_KEY = 'ksons_bag_v3';
const ORDERS_STORAGE_KEY = 'ksons_orders_v3';

function parseHashRoute(): { page: AppPage; productId?: string } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (raw.startsWith('product/')) {
    const id = raw.slice('product/'.length);
    if (id) {
      return { page: 'product', productId: id };
    }
  }
  if (
    raw === 'shop' ||
    raw === 'categories' ||
    raw === 'about' ||
    raw === 'track' ||
    raw === 'contact' ||
    raw === 'checkout' ||
    raw === 'admin'
  ) {
    return { page: raw };
  }
  return { page: 'home' };
}

export default function App() {
  const initialRoute = parseHashRoute();
  const [currentPage, setCurrentPage] = useState<AppPage>(initialRoute.page);
  const [activeProductId, setActiveProductId] = useState<string>(
    initialRoute.productId || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(
    DEFAULT_STORE_SETTINGS
  );

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [bagOpen, setBagOpen] = useState(false);
  const [recentlyAddedName, setRecentlyAddedName] = useState<string | null>(null);

  const categorySliderRef = useRef<HTMLDivElement | null>(null);
  const productSliderRef = useRef<HTMLDivElement | null>(null);
  const storySliderRef = useRef<HTMLDivElement | null>(null);
  const testimonialSliderRef = useRef<HTMLDivElement | null>(null);

  const [bagItems, setBagItems] = useState<CartEntry[]>(() => {
    try {
      const raw = localStorage.getItem(BAG_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartEntry[]) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OrderRecord[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bagItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [bagItems]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    void testFirestoreConnection();

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        const loaded: CategoryItem[] = snap.docs.map((d) => {
          const data = d.data() as Partial<CategoryItem>;
          return {
            id: d.id,
            name: data.name || 'Collection',
            image: data.image || BANNER_IMAGES.everyday,
            subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
            sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 99,
          };
        });
        loaded.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
        setCategories(loaded);
      },
      () => {
        setCategories([]);
      }
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const loaded: Product[] = snap.docs.map((d) => {
          const data = d.data() as Partial<Product>;
          const primaryImg = data.image || '';
          return {
            id: d.id,
            name: data.name || 'Product',
            category: data.category || 'Collection',
            subcategory: data.subcategory || undefined,
            series: data.series || undefined,
            pricePkr: typeof data.pricePkr === 'number' ? data.pricePkr : 0,
            compareAtPkr:
              typeof data.compareAtPkr === 'number' && data.compareAtPkr > 0
                ? data.compareAtPkr
                : undefined,
            image: primaryImg,
            gallery:
              Array.isArray(data.gallery) && data.gallery.length > 0
                ? data.gallery
                : primaryImg
                ? [primaryImg]
                : [],
            fabric: data.fabric || '',
            description: data.description || '',
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
            careInstructions: Array.isArray(data.careInstructions)
              ? data.careInstructions
              : [],
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
            colors: Array.isArray(data.colors) ? data.colors : [],
            availability: data.availability || 'In Stock',
            featured: Boolean(data.featured),
            createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
          };
        });
        loaded.sort((a, b) =>
          (b.createdAt || '').localeCompare(a.createdAt || '')
        );
        setProducts(loaded);
        setCatalogLoaded(true);
      },
      () => {
        setProducts([]);
        setCatalogLoaded(true);
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'store'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<StoreSettings>;
          setStoreSettings({
            ...DEFAULT_STORE_SETTINGS,
            ...data,
          });
        }
      },
      () => {
        // Keep default store settings seamlessly if Firestore rules are pending publish
      }
    );

    return () => {
      unsubCategories();
      unsubProducts();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    document.title = `${storeSettings.brandName} — ${storeSettings.domain}`;
  }, [storeSettings.brandName, storeSettings.domain]);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute();
      setCurrentPage(parsed.page);
      if (parsed.productId) {
        setActiveProductId(parsed.productId);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = (page: AppPage, productId?: string) => {
    if (page === 'product' && productId) {
      setActiveProductId(productId);
      setCurrentPage('product');
      window.location.hash = `#/product/${productId}`;
    } else {
      setCurrentPage(page);
      window.location.hash = `#/${page}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategoryInShop = (category: string, subcategory?: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory || '');
    navigateTo('shop');
  };

  const openSingleProduct = (product: Product) => {
    navigateTo('product', product.id);
  };

  const featuredProducts = useMemo(() => {
    const flagged = products.filter((p) => p.featured);
    return flagged.length > 0 ? flagged : products.slice(0, 10);
  }, [products]);

  const activeCategoryItem = useMemo(
    () => categories.find((c) => c.name === selectedCategory),
    [categories, selectedCategory]
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = products.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSub =
        !selectedSubcategory || item.subcategory === selectedSubcategory;
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.subcategory || '').toLowerCase().includes(query) ||
        item.fabric.toLowerCase().includes(query);
      return matchesCat && matchesSub && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.pricePkr - b.pricePkr);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.pricePkr - a.pricePkr);
    }
    return list;
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) || products[0] || null,
    [products, activeProductId]
  );

  const bagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToBag = (
    product: Product,
    quantity: number,
    options?: { size?: string; color?: string }
  ) => {
    const size =
      options?.size ??
      (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    const color =
      options?.color ??
      (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
    const key = `${product.id}__${color || ''}__${size || ''}`;

    setBagItems((prev) => {
      const existing = prev.find((entry) => entry.key === key);
      if (existing) {
        return prev.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: Math.min(20, entry.quantity + quantity) }
            : entry
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          image: product.image,
          ...(size ? { selectedSize: size } : {}),
          ...(color ? { selectedColor: color } : {}),
          quantity,
          pricePkr: product.pricePkr,
        },
      ];
    });

    setRecentlyAddedName(product.name);
    window.setTimeout(() => {
      setRecentlyAddedName((current) =>
        current === product.name ? null : current
      );
    }, 3000);
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((entry) =>
          entry.key === key
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setBagItems((prev) => prev.filter((entry) => entry.key !== key));
  };

  const handlePlaceOrder = async (newOrder: OrderRecord) => {
    try {
      await setDoc(doc(db, 'orders', newOrder.orderId), newOrder);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.orderId}`);
      } catch {
        // Still record locally if Firestore rules haven't been published yet
      }
    }
    setOrders((prev) => [newOrder, ...prev]);
    setBagItems([]);
  };

  const slideTrack = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F5FAFB] text-[#0E171D]">
      <PointerGlow />

      <Header
        currentPage={currentPage}
        bagCount={bagCount}
        categories={categories}
        storeSettings={storeSettings}
        onNavigate={(page) => navigateTo(page)}
        onSelectCategory={openCategoryInShop}
        onOpenBag={() => setBagOpen(true)}
      />

      <main>
        {/* HOME PAGE */}
        {currentPage === 'home' && (
          <>
            {/* 1. Compact Full-Width Hero Carousel */}
            <HeroCarousel onSelectCategory={(cat) => openCategoryInShop(cat)} />

            {/* 2. Store Guarantees Strip */}
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
                <div className="flex w-[240px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-[#DCEBEF] bg-white p-4 transition-shadow hover:shadow-md lg:w-auto">
                  <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
                    <Truck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-[#546A76]">2–4 days nationwide</p>
                  </div>
                </div>

                <div className="flex w-[240px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-[#DCEBEF] bg-white p-4 transition-shadow hover:shadow-md lg:w-auto">
                  <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
                    <Lock className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      Discreet Packing
                    </p>
                    <p className="text-xs text-[#546A76]">Plain unmarked parcels</p>
                  </div>
                </div>

                <div className="flex w-[240px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-[#DCEBEF] bg-white p-4 transition-shadow hover:shadow-md lg:w-auto">
                  <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      100% Free Delivery
                    </p>
                    <p className="text-xs text-[#546A76]">Free nationwide shipping</p>
                  </div>
                </div>

                <div className="flex w-[240px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-[#DCEBEF] bg-white p-4 transition-shadow hover:shadow-md lg:w-auto">
                  <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
                    <PhoneCall className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      WhatsApp Support
                    </p>
                    <p className="text-xs font-medium text-[#546A76] tabular-nums">
                      {storeSettings.primaryPhone}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Slidable Categories Carousel */}
            <section className="border-t border-[#E3EFF2] py-10">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-xs font-bold tracking-wider text-[#118A9B] uppercase">
                      Categories
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
                      Shop by Category
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => slideTrack(categorySliderRef, 'left')}
                      aria-label="Scroll categories left"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => slideTrack(categorySliderRef, 'right')}
                      aria-label="Scroll categories right"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-[#DCEBEF] bg-white p-8 text-center">
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      {catalogLoaded ? 'No categories published yet' : 'Loading categories...'}
                    </p>
                    <p className="mt-1 text-xs text-[#546A76]">
                      Collections added from the Admin Panel will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div
                    ref={categorySliderRef}
                    className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => openCategoryInShop(cat.name)}
                        className="group w-[170px] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#DCEBEF] bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-[205px] cursor-pointer"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-[#F5FAFB]">
                          <ProductImage
                            src={cat.image}
                            alt={cat.name}
                            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3.5">
                          <p className="font-display text-sm font-bold text-[#0E171D] group-hover:text-[#118A9B]">
                            {cat.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Slidable Featured Products Carousel */}
            <section className="border-t border-[#E3EFF2] bg-white/60 py-10">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-xs font-bold tracking-wider text-[#118A9B] uppercase">
                      Trending
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
                      Best Sellers &amp; New Arrivals
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => slideTrack(productSliderRef, 'left')}
                      aria-label="Scroll products left"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => slideTrack(productSliderRef, 'right')}
                      aria-label="Scroll products right"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {featuredProducts.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-[#DCEBEF] bg-white p-8 text-center">
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      {catalogLoaded ? 'No products published yet' : 'Loading products...'}
                    </p>
                    <p className="mt-1 text-xs text-[#546A76]">
                      Products published from your Admin Dashboard will showcase here immediately.
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      ref={productSliderRef}
                      className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
                    >
                      {featuredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="w-[265px] shrink-0 snap-start sm:w-[300px]"
                        >
                          <ProductCard
                            product={product}
                            onOpenProduct={openSingleProduct}
                            onAddToBag={handleAddToBag}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => openCategoryInShop('All')}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-6 py-2 font-display text-sm font-semibold text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer"
                      >
                        <span>View All {products.length} Products</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* 5. Compact Mid-Page Full-Width Promo Banner */}
            <section className="relative w-full overflow-hidden bg-[#09181D]">
              <div className="relative min-h-[240px] w-full sm:min-h-[280px]">
                <ProductImage
                  src={BANNER_IMAGES.packaging}
                  alt="K&SON'S Wholesale and Retail"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
                <div className="relative z-10 mx-auto flex min-h-[240px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[280px] sm:px-6 lg:px-8">
                  <div className="max-w-lg">
                    <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
                      Retail &amp; Wholesale
                    </p>
                    <h2 className="mt-1.5 font-display text-2xl font-extrabold text-white uppercase sm:text-3xl">
                      Free Delivery Across Pakistan
                    </h2>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openCategoryInShop('All')}
                        className="min-h-[42px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 font-display text-sm font-semibold text-white cursor-pointer"
                      >
                        Shop Collection
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('categories')}
                        className="min-h-[42px] rounded-lg border border-white/30 bg-black/30 px-5 py-2 font-display text-sm font-semibold text-white backdrop-blur-xs hover:bg-black/50 cursor-pointer"
                      >
                        View Categories
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. About Our Story with Slidable Quality Highlights */}
            <section className="border-t border-[#E3EFF2] py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-[#DCEBEF] bg-white p-6 sm:p-10 lg:grid-cols-12">
                  <div className="brand-soft-bg flex flex-col items-center justify-center rounded-2xl p-6 text-center lg:col-span-4">
                    <BrandLogo size="xl" />
                    <button
                      type="button"
                      onClick={() => navigateTo('about')}
                      className="mt-4 inline-flex items-center gap-1.5 font-display text-xs font-bold text-[#118A9B] hover:underline cursor-pointer"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="min-w-0 lg:col-span-8">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-display text-xs font-bold tracking-wider text-[#118A9B] uppercase">
                          About Our Story
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
                          Crafted for Comfort &amp; Privacy
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => slideTrack(storySliderRef, 'left')}
                          aria-label="Scroll story highlights left"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4E3E7] bg-[#F5FAFB] text-[#0E171D] cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => slideTrack(storySliderRef, 'right')}
                          aria-label="Scroll story highlights right"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D4E3E7] bg-[#F5FAFB] text-[#0E171D] cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2.5 text-sm text-[#425561]">
                      Soft fabrics, honest PKR pricing, and sealed discreet parcels across Pakistan.
                    </p>

                    <div
                      ref={storySliderRef}
                      className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-1"
                    >
                      {QUALITY_PARTNERS.map((brand) => (
                        <div
                          key={brand.title}
                          className="w-[185px] shrink-0 snap-start rounded-xl border border-[#E6F1F4] bg-[#F5FAFB] p-4"
                        >
                          <div className="brand-gradient inline-flex h-8 w-8 items-center justify-center rounded-lg text-white">
                            <Award className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <p className="mt-2.5 font-display text-sm font-bold text-[#0E171D]">
                            {brand.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#546A76]">
                            {brand.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Slidable Customer Testimonials Carousel */}
            <section className="border-t border-[#E3EFF2] bg-white/60 py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-xs font-bold tracking-wider text-[#118A9B] uppercase">
                      Reviews
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
                      Customer Stories
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => slideTrack(testimonialSliderRef, 'left')}
                      aria-label="Scroll reviews left"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => slideTrack(testimonialSliderRef, 'right')}
                      aria-label="Scroll reviews right"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D4E3E7] bg-white text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div
                  ref={testimonialSliderRef}
                  className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
                >
                  {TESTIMONIALS.map((review) => (
                    <div
                      key={review.id}
                      className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:w-[320px]"
                    >
                      <p className="text-sm leading-relaxed text-[#334550]">
                        &ldquo;{review.quote}&rdquo;
                      </p>
                      <div className="mt-5 border-t border-[#EBF3F5] pt-3.5">
                        <p className="font-display text-sm font-bold text-[#0E171D]">
                          {review.name}
                        </p>
                        <p className="text-xs text-[#546A76]">
                          {review.city} · {review.productPurchased}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7B. Additional Full-Width Bridal & Shapewear Banner */}
            <section className="relative w-full overflow-hidden bg-[#09181D]">
              <div className="relative min-h-[220px] w-full sm:min-h-[260px]">
                <ProductImage
                  src={BANNER_IMAGES.bridal}
                  alt="Bridal Satin & Everyday Shapewear"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
                <div className="relative z-10 mx-auto flex min-h-[220px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[260px] sm:px-6 lg:px-8">
                  <div className="max-w-lg">
                    <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
                      Trousseau &amp; Everyday Comfort
                    </p>
                    <h2 className="mt-1.5 font-display text-2xl font-extrabold text-white uppercase sm:text-3xl">
                      Bridal Satin &amp; Seamless Shapewear
                    </h2>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openCategoryInShop('All')}
                        className="min-h-[42px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 font-display text-sm font-semibold text-white cursor-pointer"
                      >
                        Shop Collection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Compact FAQ & Newsletter */}
            <section className="border-t border-[#E3EFF2] py-12">
              <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
                {/* FAQ Column */}
                <div className="lg:col-span-7">
                  <p className="font-display text-xs font-bold tracking-wider text-[#118A9B] uppercase">
                    FAQs
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
                    Quick Answers
                  </h2>

                  <div className="mt-5 space-y-2.5">
                    {FAQS.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div
                          key={faq.question}
                          className="overflow-hidden rounded-xl border border-[#DCEBEF] bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left font-display text-sm font-semibold text-[#0E171D] hover:bg-[#F5FAFB] cursor-pointer"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-[#118A9B] transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                          {isOpen && (
                            <div className="border-t border-[#EBF3F5] px-5 py-3.5 text-xs leading-relaxed text-[#425561] sm:text-sm">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Newsletter Column */}
                <div className="flex flex-col justify-center rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:p-8 lg:col-span-5">
                  <div className="brand-gradient inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-extrabold text-[#0E171D] uppercase">
                    New Arrival Alerts
                  </h2>
                  <p className="mt-1.5 text-sm text-[#425561]">
                    Join for restock and seasonal collection alerts.
                  </p>

                  {newsletterSubscribed ? (
                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#BCE3E8] bg-[#EEF8F9] px-4 py-3 text-xs font-semibold text-[#0D7280]">
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Subscribed to K&amp;SON&apos;S updates.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="mt-5 space-y-3">
                      <label htmlFor="newsletter-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="min-h-[44px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-4 py-2.5 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] w-full rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2.5 font-display text-sm font-semibold text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* SHOP PAGE */}
        {currentPage === 'shop' && (
          <div className="bg-[#F5FAFB]">
            {/* Compact Full-Width Shop Banner */}
            <section className="relative w-full overflow-hidden bg-[#09181D]">
              <div className="relative min-h-[200px] w-full sm:min-h-[240px]">
                <ProductImage
                  src={BANNER_IMAGES.winter}
                  alt="Shop K&SON'S COLLECTION'S"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07151A]/90 via-[#07151A]/65 to-transparent" />
                <div className="relative z-10 mx-auto flex min-h-[200px] max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[240px] sm:px-6 lg:px-8">
                  <p className="font-display text-xs font-semibold tracking-widest text-[#7ADBE8] uppercase">
                    Catalog
                  </p>
                  <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
                    {selectedCategory === 'All' ? 'Shop All Products' : selectedCategory}
                  </h1>
                </div>
              </div>
            </section>

            {/* Filter & Grid Section */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="relative max-w-md flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6B7D88]"
                    aria-hidden="true"
                  />
                  <label htmlFor="shop-search" className="sr-only">
                    Search catalog
                  </label>
                  <input
                    id="shop-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search high-neck, socks, bra, shapewear..."
                    className="min-h-[42px] w-full rounded-lg border border-[#D4E3E7] bg-white py-2 pr-4 pl-10 text-sm text-[#0E171D] focus:border-[#118A9B] focus:outline-none"
                  />
                </div>

                <div className="relative flex items-center">
                  <SlidersHorizontal
                    className="pointer-events-none absolute left-3 h-4 w-4 text-[#6B7D88]"
                    aria-hidden="true"
                  />
                  <label htmlFor="shop-sort" className="sr-only">
                    Sort products
                  </label>
                  <select
                    id="shop-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="min-h-[42px] rounded-lg border border-[#D4E3E7] bg-white py-2 pr-8 pl-9 text-sm font-semibold text-[#0E171D] focus:border-[#118A9B] focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Category Tabs */}
              <div
                role="tablist"
                aria-label="Shop categories"
                className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === 'All'}
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubcategory('');
                  }}
                  className={`min-h-[38px] rounded-lg border px-4 py-2 font-display text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'border-[#118A9B] bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white'
                      : 'border-[#D4E3E7] bg-white text-[#425561] hover:border-[#9EB0BA]'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => {
                  const active = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSelectedSubcategory('');
                      }}
                      className={`min-h-[38px] rounded-lg border px-4 py-2 font-display text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'border-[#118A9B] bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white'
                          : 'border-[#D4E3E7] bg-white text-[#425561] hover:border-[#9EB0BA]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Subcategory Pills when a Category has subcategories */}
              {activeCategoryItem && activeCategoryItem.subcategories.length > 0 && (
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategory('')}
                    className={`rounded-md border px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                      !selectedSubcategory
                        ? 'border-[#118A9B] bg-[#EEF9FB] text-[#118A9B]'
                        : 'border-[#DCEBEF] bg-white text-[#546A76]'
                    }`}
                  >
                    All {activeCategoryItem.name}
                  </button>
                  {activeCategoryItem.subcategories.map((sub) => {
                    const activeSub = selectedSubcategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`rounded-md border px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                          activeSub
                            ? 'border-[#118A9B] bg-[#EEF9FB] text-[#118A9B]'
                            : 'border-[#DCEBEF] bg-white text-[#546A76]'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-[#DCEBEF] bg-white p-10 text-center">
                  <p className="font-display text-base font-semibold text-[#0E171D]">
                    {products.length === 0
                      ? catalogLoaded
                        ? 'No products have been added yet'
                        : 'Loading store catalog...'
                      : 'No products matched your search'}
                  </p>
                  <p className="mt-1.5 text-xs text-[#546A76]">
                    {products.length === 0
                      ? 'Add your categories and products from the Admin Panel to display them here.'
                      : 'Try clearing your search or choosing another category.'}
                  </p>
                  {products.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedSubcategory('');
                        setSearchQuery('');
                      }}
                      className="mt-4 min-h-[40px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 text-sm font-semibold text-white cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigateTo('home')}
                      className="mt-4 min-h-[40px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2 text-sm font-semibold text-white cursor-pointer"
                    >
                      Back to Home
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenProduct={openSingleProduct}
                      onAddToBag={(p, qty) => handleAddToBag(p, qty)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* DEDICATED CATEGORIES PAGE */}
        {currentPage === 'categories' && (
          <CategoriesPage
            categories={categories}
            products={products}
            onSelectCategory={openCategoryInShop}
            onGoShopAll={() => openCategoryInShop('All')}
          />
        )}

        {/* SINGLE PRODUCT PAGE */}
        {currentPage === 'product' && (
          activeProduct ? (
            <SingleProductPage
              product={activeProduct}
              allProducts={products}
              storeSettings={storeSettings}
              onBackToShop={(cat) => openCategoryInShop(cat || 'All')}
              onOpenProduct={openSingleProduct}
              onAddToBag={handleAddToBag}
            />
          ) : (
            <div className="mx-auto max-w-2xl px-4 py-20 text-center">
              <div className="rounded-3xl border border-[#DCEBEF] bg-white p-10">
                <h1 className="font-display text-2xl font-extrabold text-[#0E171D] uppercase">
                  Product Unavailable
                </h1>
                <p className="mt-2 text-sm text-[#546A76]">
                  This product is currently unavailable or has been removed from the catalog.
                </p>
                <button
                  type="button"
                  onClick={() => openCategoryInShop('All')}
                  className="mt-6 min-h-[42px] rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-6 py-2 font-display text-sm font-semibold text-white cursor-pointer"
                >
                  Return to Shop
                </button>
              </div>
            </div>
          )
        )}

        {/* EASY CHECKOUT PAGE */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            items={bagItems}
            storeSettings={storeSettings}
            onBackToShop={() => openCategoryInShop('All')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {/* ADMIN DASHBOARD */}
        {currentPage === 'admin' && (
          <AdminPage
            categories={categories}
            products={products}
            storeSettings={storeSettings}
            onBackToStore={() => navigateTo('home')}
          />
        )}

        {/* ABOUT US PAGE */}
        {currentPage === 'about' && (
          <AboutPage
            storeSettings={storeSettings}
            onGoShop={() => openCategoryInShop('All')}
            onGoContact={() => navigateTo('contact')}
          />
        )}

        {/* TRACK ORDER PAGE */}
        {currentPage === 'track' && (
          <TrackOrderPage orders={orders} storeSettings={storeSettings} />
        )}

        {/* CONTACT US PAGE */}
        {currentPage === 'contact' && (
          <ContactPage storeSettings={storeSettings} />
        )}
      </main>

      <Footer
        categories={categories}
        storeSettings={storeSettings}
        onNavigate={(page) => navigateTo(page)}
        onSelectCategory={(cat) => openCategoryInShop(cat)}
      />

      {/* Slide-Over Bag Drawer */}
      <CartDrawer
        isOpen={bagOpen}
        items={bagItems}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setBagOpen(false);
          navigateTo('checkout');
        }}
      />

      {/* Fixed Floating Circular WhatsApp Icon Button (Left Side) */}
      <a
        href={`https://wa.me/${toWhatsAppDigits(storeSettings.primaryPhone)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-4 left-4 z-40 inline-flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-r from-[#0E8F6B] to-[#118A9B] text-white shadow-lg transition-transform duration-150 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </a>

      {/* Non-intrusive Add-to-Bag Notification (Right Side) */}
      {recentlyAddedName && !bagOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-40 flex items-center gap-3 rounded-xl border border-[#DCEBEF] bg-white px-4 py-3 text-xs text-[#0E171D] shadow-xl"
        >
          <Check className="h-4 w-4 shrink-0 text-[#118A9B]" aria-hidden="true" />
          <span className="max-w-[160px] truncate font-semibold sm:max-w-xs">
            Added {recentlyAddedName}
          </span>
          <button
            type="button"
            onClick={() => {
              setRecentlyAddedName(null);
              setBagOpen(true);
            }}
            className="rounded-md bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-2.5 py-1 font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Bag ({bagCount})
          </button>
        </div>
      )}
    </div>
  );
}
