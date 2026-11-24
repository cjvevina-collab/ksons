import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Check,
  FolderTree,
  ImagePlus,
  Lock,
  LogOut,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  CategoryItem,
  OrderRecord,
  Product,
  ProductColor,
  StoreSettings,
  formatPkr,
} from '../data/catalog';
import {
  ADMIN_UID,
  OperationType,
  auth,
  db,
  handleFirestoreError,
} from '../lib/firebase';
import { ProductImage } from './ProductImage';

interface AdminPageProps {
  categories: CategoryItem[];
  products: Product[];
  storeSettings: StoreSettings;
  onBackToStore: () => void;
}

const PRESET_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '32B',
  '34B',
  '34C',
  '36B',
  '36C',
  '38C',
  '38D',
  'Free Size',
];

const PRESET_COLORS: ProductColor[] = [
  { name: 'Black', hex: '#1B1F24' },
  { name: 'White', hex: '#F4F6F8' },
  { name: 'Ivory', hex: '#EAE5DC' },
  { name: 'Aqua Blue', hex: '#23B5C8' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Beige', hex: '#D4B8A0' },
  { name: 'Rose', hex: '#C2747B' },
  { name: 'Maroon', hex: '#7A2E3A' },
  { name: 'Sage', hex: '#7B988F' },
  { name: 'Grey', hex: '#7A838C' },
];

function slugifyId(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${base || 'item'}-${Date.now().toString(36)}`;
}

async function uploadToImgBB(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in first.');
  const token = await user.getIdToken();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  const resp = await fetch('/api/upload-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64: dataUrl,
      name: file.name.replace(/\.[^.]+$/, ''),
    }),
  });

  const payload = (await resp.json()) as { url?: string; error?: string };
  if (!resp.ok || !payload.url) {
    throw new Error(payload.error || 'Image upload failed.');
  }
  return payload.url;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  categories,
  products,
  storeSettings,
  onBackToStore,
}) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'categories' | 'settings'
  >('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorBanner, setErrorBanner] = useState('');
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catSubInput, setCatSubInput] = useState('');
  const [catSubs, setCatSubs] = useState<string[]>([]);
  const [uploadingCatImg, setUploadingCatImg] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  // Product Form State
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || '');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodFabric, setProdFabric] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodAvailability, setProdAvailability] = useState<
    'In Stock' | 'New Arrival' | 'Best Seller' | 'Out of Stock'
  >('In Stock');
  const [prodFeatured, setProdFeatured] = useState(true);
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImgUrlInput, setProdImgUrlInput] = useState('');
  const [prodSizes, setProdSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [prodColors, setProdColors] = useState<ProductColor[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#23B5C8');
  const [uploadingProdImg, setUploadingProdImg] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [savingProd, setSavingProd] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.uid !== ADMIN_UID) {
        setAuthError('Access denied: This account does not have admin permission.');
        void signOut(auth);
        setAuthUser(null);
      } else {
        setAuthUser(user);
      }
      setAuthChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser || authUser.uid !== ADMIN_UID) return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as OrderRecord);
        setOrders(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        } catch (wrapped) {
          setErrorBanner(
            wrapped instanceof Error ? wrapped.message : 'Unable to load orders.'
          );
        }
      }
    );
    return () => unsub();
  }, [authUser]);

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c.name === prodCategory),
    [categories, prodCategory]
  );

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setErrorBanner('');
    window.setTimeout(() => {
      setStatusMessage((curr) => (curr === msg ? '' : curr));
    }, 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSigningIn(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (cred.user.uid !== ADMIN_UID) {
        await signOut(auth);
        setAuthError('Unauthorized user UID. Admin access restricted.');
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message.replace('Firebase: ', '')
          : 'Invalid email or password.'
      );
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !settingsForm.codEnabled &&
      !settingsForm.easypaisaEnabled &&
      !settingsForm.jazzcashEnabled &&
      !settingsForm.bankEnabled
    ) {
      setErrorBanner('Please keep at least one payment method enabled.');
      return;
    }

    setSavingSettings(true);
    setErrorBanner('');
    try {
      await setDoc(doc(db, 'settings', 'store'), {
        ...settingsForm,
        brandName: settingsForm.brandName.trim().slice(0, 100),
        shortMark: settingsForm.shortMark.trim().slice(0, 40),
        domain: settingsForm.domain.trim().slice(0, 120),
        email: settingsForm.email.trim().slice(0, 120),
        primaryPhone: settingsForm.primaryPhone.trim().slice(0, 40),
        secondaryPhone: settingsForm.secondaryPhone.trim().slice(0, 40),
        updatedAt: new Date().toISOString(),
      });
      showToast('Website settings & payment details updated.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'settings/store');
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to save website settings.'
        );
      }
    } finally {
      setSavingSettings(false);
    }
  };

  // Category CRUD
  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatImage('');
    setCatSubs([]);
    setCatSubInput('');
  };

  const handleCatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatImg(true);
    setErrorBanner('');
    try {
      const url = await uploadToImgBB(file);
      setCatImage(url);
      showToast('Category image uploaded via ImgBB.');
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingCatImg(false);
      e.target.value = '';
    }
  };

  const handleAddSubcategory = () => {
    const clean = catSubInput.trim();
    if (!clean) return;
    if (!catSubs.includes(clean)) {
      setCatSubs((prev) => [...prev, clean]);
    }
    setCatSubInput('');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    setErrorBanner('');
    const now = new Date().toISOString();
    const id = editingCatId || slugifyId(`cat-${catName}`);
    try {
      await setDoc(doc(db, 'categories', id), {
        name: catName.trim().slice(0, 80),
        image: catImage.trim().slice(0, 600),
        subcategories: catSubs.slice(0, 30),
        sortOrder: categories.length + 1,
        createdAt: now,
        updatedAt: now,
      });
      showToast(editingCatId ? 'Category updated.' : 'Category created.');
      resetCategoryForm();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `categories/${id}`);
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to save category.'
        );
      }
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      showToast('Category removed.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to delete category.'
        );
      }
    }
  };

  // Product CRUD
  const resetProductForm = () => {
    setEditingProdId(null);
    setProdName('');
    setProdCategory(categories[0]?.name || '');
    setProdSubcategory('');
    setProdPrice('');
    setProdComparePrice('');
    setProdFabric('');
    setProdDesc('');
    setProdAvailability('In Stock');
    setProdFeatured(true);
    setProdImages([]);
    setProdImgUrlInput('');
    setProdSizes([]);
    setProdColors([]);
  };

  const handleProductFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingProdImg(true);
    setErrorBanner('');
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i += 1) {
        setUploadProgressText(`Uploading ${i + 1} of ${files.length}...`);
        const url = await uploadToImgBB(files[i]);
        uploadedUrls.push(url);
      }
      setProdImages((prev) => [...prev, ...uploadedUrls]);
      showToast(`${uploadedUrls.length} image(s) uploaded to ImgBB.`);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingProdImg(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  const toggleSize = (sz: string) => {
    setProdSizes((prev) =>
      prev.includes(sz) ? prev.filter((item) => item !== sz) : [...prev, sz]
    );
  };

  const addCustomSize = () => {
    const clean = customSizeInput.trim();
    if (!clean) return;
    if (!prodSizes.includes(clean)) {
      setProdSizes((prev) => [...prev, clean]);
    }
    setCustomSizeInput('');
  };

  const toggleColor = (c: ProductColor) => {
    setProdColors((prev) =>
      prev.some((item) => item.name === c.name)
        ? prev.filter((item) => item.name !== c.name)
        : [...prev, c]
    );
  };

  const addCustomColor = () => {
    const clean = customColorName.trim();
    if (!clean) return;
    if (!prodColors.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      setProdColors((prev) => [...prev, { name: clean, hex: customColorHex }]);
    }
    setCustomColorName('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(prodPrice);
    if (!prodName.trim() || !prodCategory.trim() || !numericPrice || prodImages.length === 0) {
      setErrorBanner(
        'Please enter product name, category, valid price (PKR), and at least 1 product image.'
      );
      return;
    }

    setSavingProd(true);
    setErrorBanner('');
    const now = new Date().toISOString();
    const id = editingProdId || slugifyId(prodName);
    const compareVal = Number(prodComparePrice);

    try {
      await setDoc(doc(db, 'products', id), {
        name: prodName.trim().slice(0, 120),
        category: prodCategory.trim().slice(0, 80),
        subcategory: prodSubcategory.trim().slice(0, 80),
        series: '',
        pricePkr: Math.round(numericPrice),
        compareAtPkr: compareVal > numericPrice ? Math.round(compareVal) : null,
        image: prodImages[0],
        gallery: prodImages,
        fabric: prodFabric.trim().slice(0, 160),
        description: prodDesc.trim().slice(0, 1500),
        highlights: [
          'Discreet sealed parcel packaging',
          'Cash on Delivery, Easypaisa & JazzCash accepted',
        ],
        careInstructions: ['Cold gentle wash', 'Air dry in shade'],
        sizes: prodSizes,
        colors: prodColors,
        availability: prodAvailability,
        featured: prodFeatured,
        createdAt: now,
        updatedAt: now,
      });
      showToast(editingProdId ? 'Product updated.' : 'Product published to store.');
      resetProductForm();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to save product.'
        );
      }
    } finally {
      setSavingProd(false);
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProdId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdSubcategory(p.subcategory || '');
    setProdPrice(String(p.pricePkr));
    setProdComparePrice(p.compareAtPkr ? String(p.compareAtPkr) : '');
    setProdFabric(p.fabric || '');
    setProdDesc(p.description || '');
    setProdAvailability(p.availability);
    setProdFeatured(Boolean(p.featured));
    setProdImages(p.gallery && p.gallery.length > 0 ? p.gallery : [p.image]);
    setProdSizes(p.sizes || []);
    setProdColors(p.colors || []);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('Product deleted.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to delete product.'
        );
      }
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderRecord['status']
  ) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Order ${orderId} marked ${status}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to update order.'
        );
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      showToast(`Order ${orderId} deleted.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
      } catch (wrapped) {
        setErrorBanner(
          wrapped instanceof Error ? wrapped.message : 'Failed to delete order.'
        );
      }
    }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F5FAFB]">
        <p className="font-display text-sm font-semibold text-[#546A76]">
          Verifying session...
        </p>
      </div>
    );
  }

  // Email & Password Login Only
  if (!authUser) {
    return (
      <div className="bg-[#F5FAFB] py-16 sm:py-24">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-3xl border border-[#DCEBEF] bg-white p-8 shadow-sm">
            <div className="brand-gradient inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>

            <h1 className="mt-5 font-display text-2xl font-extrabold text-[#0E171D] uppercase">
              Admin Sign In
            </h1>
            <p className="mt-1.5 text-sm text-[#546A76]">
              Sign in with your authorized email and password to manage categories, products, and orders.
            </p>

            {authError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[#F0B4AE] bg-[#FEF3F2] px-4 py-3 text-xs font-semibold text-[#B42318]"
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-[#0E171D] uppercase"
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ksons-collections.store"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-[#0E171D] uppercase"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3.5 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={signingIn}
                className="min-h-[46px] w-full rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-3 font-display text-sm font-bold text-white transition-all hover:from-[#0E7483] hover:to-[#179EB0] disabled:opacity-60 cursor-pointer"
              >
                {signingIn ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <button
              type="button"
              onClick={onBackToStore}
              className="mt-5 w-full text-center text-xs font-semibold text-[#546A76] hover:text-[#118A9B] cursor-pointer"
            >
              ← Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5FAFB] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#DCEBEF] bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#118A9B] uppercase">
              Store Management · {authUser.email}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-[#0E171D] uppercase sm:text-3xl">
              {storeSettings.shortMark} Admin Panel
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToStore}
              className="min-h-[40px] rounded-lg border border-[#D4E3E7] bg-white px-3.5 py-2 text-xs font-semibold text-[#0E171D] hover:bg-[#F5FAFB] cursor-pointer"
            >
              View Store
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#0E171D] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#22323D] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#BCE3E8] bg-[#EEF8F9] px-4 py-3 text-xs font-semibold text-[#0D7280]">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorBanner && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[#F0B4AE] bg-[#FEF3F2] px-4 py-3 text-xs font-semibold text-[#B42318]"
          >
            {errorBanner}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 font-display text-xs font-bold uppercase cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#118A9B] bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white'
                : 'border-[#DCEBEF] bg-white text-[#425561]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 font-display text-xs font-bold uppercase cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#118A9B] bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white'
                : 'border-[#DCEBEF] bg-white text-[#425561]'
            }`}
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            <span>Products ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 font-display text-xs font-bold uppercase cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#118A9B] bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white'
                : 'border-[#DCEBEF] bg-white text-[#425561]'
            }`}
          >
            <FolderTree className="h-4 w-4" aria-hidden="true" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg border px-4 py-2 font-display text-xs font-bold uppercase cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#118A9B] bg-gradient-to-r from-[#118A9B] to-[#23B5C8] text-white'
                : 'border-[#DCEBEF] bg-white text-[#425561]'
            }`}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span>Website Settings</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-[#DCEBEF] bg-white p-12 text-center">
                <p className="font-display text-base font-bold text-[#0E171D]">
                  No orders received in Firestore yet
                </p>
                <p className="mt-1 text-xs text-[#546A76]">
                  Orders placed by customers in Easy Checkout appear here automatically.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.orderId}
                  className="rounded-2xl border border-[#DCEBEF] bg-white p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EBF3F5] pb-4">
                    <div>
                      <p className="font-display text-lg font-extrabold text-[#0E171D] tabular-nums">
                        {order.orderId} · {order.customerName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#546A76]">
                        {order.phone} · {order.city} · {order.paymentMethod}
                      </p>
                      <p className="mt-1 text-xs text-[#425561]">{order.address}</p>
                      {order.notes && (
                        <p className="mt-1 text-xs font-medium text-[#118A9B]">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          void handleUpdateOrderStatus(
                            order.orderId,
                            e.target.value as OrderRecord['status']
                          )
                        }
                        aria-label={`Order status for ${order.orderId}`}
                        className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-1.5 text-xs font-bold text-[#0E171D] cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Discreetly Packed">Discreetly Packed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => void handleDeleteOrder(order.orderId)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCEBEF] text-[#6B7D88] hover:border-[#F0B4AE] hover:text-[#B42318] cursor-pointer"
                        aria-label={`Delete order ${order.orderId}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={`${order.orderId}-${idx}`} className="text-[#334550]">
                          <strong className="font-semibold">{item.name}</strong>
                          {item.selectedColor ? ` (${item.selectedColor})` : ''}
                          {item.selectedSize ? ` [Size ${item.selectedSize}]` : ''} ×{' '}
                          {item.quantity} — {formatPkr(item.pricePkr * item.quantity)}
                        </p>
                      ))}
                    </div>
                    <p className="font-display text-lg font-extrabold text-[#0E171D] tabular-nums">
                      {formatPkr(order.totalPkr)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Add / Edit Product Form */}
            <form
              onSubmit={handleSaveProduct}
              className="space-y-5 rounded-2xl border border-[#DCEBEF] bg-white p-6 lg:col-span-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-[#0E171D] uppercase">
                  {editingProdId ? 'Edit Product' : 'Add New Product'}
                </h2>
                {editingProdId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-xs font-semibold text-[#118A9B] underline cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E171D] uppercase">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Soft Ribbed High-Neck"
                  className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D] focus:border-[#118A9B] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#0E171D] uppercase">
                    Category
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => {
                      setProdCategory(e.target.value);
                      setProdSubcategory('');
                    }}
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E171D] uppercase">
                    Subcategory
                  </label>
                  <select
                    value={prodSubcategory}
                    onChange={(e) => setProdSubcategory(e.target.value)}
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                  >
                    <option value="">None / General</option>
                    {(activeCategoryObj?.subcategories || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0E171D] uppercase">
                    Price (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="1850"
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0E171D] uppercase">
                    Old Price (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(e.target.value)}
                    placeholder="2200"
                    className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E171D] uppercase">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  value={prodFabric}
                  onChange={(e) => setProdFabric(e.target.value)}
                  placeholder="92% Combed Cotton · 8% Elastane"
                  className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E171D] uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Short clear product description..."
                  className="mt-1.5 w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                />
              </div>

              {/* ImgBB Upload + URL */}
              <div>
                <span className="block text-xs font-bold text-[#0E171D] uppercase">
                  Product Images (ImgBB Upload)
                </span>
                <label className="mt-2 flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#118A9B] bg-[#EEF9FB] px-4 py-2 text-xs font-bold text-[#118A9B] hover:bg-[#E1F4F8]">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {uploadingProdImg
                      ? uploadProgressText || 'Uploading to ImgBB...'
                      : 'Upload Multiple Image(s) via ImgBB'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProductFileUpload}
                    className="sr-only"
                  />
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    type="url"
                    value={prodImgUrlInput}
                    onChange={(e) => setProdImgUrlInput(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="min-h-[38px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-1.5 text-xs text-[#0E171D]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (prodImgUrlInput.trim()) {
                        setProdImages((prev) => [...prev, prodImgUrlInput.trim()]);
                        setProdImgUrlInput('');
                      }
                    }}
                    className="rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs font-semibold text-[#0E171D] cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {prodImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prodImages.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative h-14 w-14 overflow-hidden rounded-lg border border-[#DCEBEF]">
                        <ProductImage src={url} alt="Preview" className="h-full w-full" />
                        <button
                          type="button"
                          onClick={() =>
                            setProdImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-0.5 right-0.5 rounded bg-black/70 px-1 text-[10px] font-bold text-white cursor-pointer"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tick-Box Sizes */}
              <div>
                <span className="block text-xs font-bold text-[#0E171D] uppercase">
                  Sizes (Tick to Enable on Store)
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_SIZES.map((sz) => {
                    const checked = prodSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                          checked
                            ? 'border-[#118A9B] bg-[#118A9B] text-white'
                            : 'border-[#D4E3E7] bg-[#F5FAFB] text-[#425561]'
                        }`}
                      >
                        {checked ? `✓ ${sz}` : sz}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Custom size..."
                    className="min-h-[34px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs font-semibold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Tick-Box Colors */}
              <div>
                <span className="block text-xs font-bold text-[#0E171D] uppercase">
                  Colors (Tick to Enable on Store)
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((c) => {
                    const checked = prodColors.some((item) => item.name === c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleColor(c)}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                          checked
                            ? 'border-[#118A9B] bg-[#EEF9FB] text-[#0E171D]'
                            : 'border-[#D4E3E7] bg-white text-[#546A76]'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/15"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded border border-[#D4E3E7]"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="Custom color name..."
                    className="min-h-[34px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs font-semibold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={prodAvailability}
                  onChange={(e) =>
                    setProdAvailability(
                      e.target.value as
                        | 'In Stock'
                        | 'New Arrival'
                        | 'Best Seller'
                        | 'Out of Stock'
                    )
                  }
                  className="min-h-[40px] rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs font-semibold"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="accent-[#118A9B]"
                  />
                  <span>Featured Slider</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingProd}
                className="min-h-[44px] w-full rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2.5 font-display text-sm font-bold text-white cursor-pointer"
              >
                {savingProd
                  ? 'Saving...'
                  : editingProdId
                  ? 'Update Product'
                  : 'Publish Product'}
              </button>
            </form>

            {/* Existing Products List */}
            <div className="space-y-3 lg:col-span-7">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCEBEF] bg-white p-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#DCEBEF]">
                      <ProductImage src={p.image} alt={p.name} className="h-full w-full" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-[#0E171D]">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#546A76]">
                        {p.category}
                        {p.subcategory ? ` · ${p.subcategory}` : ''} ·{' '}
                        <strong className="text-[#0E171D]">{formatPkr(p.pricePkr)}</strong>
                      </p>
                      {(p.sizes?.length || 0) > 0 || (p.colors?.length || 0) > 0 ? (
                        <p className="mt-0.5 text-[11px] text-[#118A9B]">
                          {p.sizes?.length ? `${p.sizes.length} sizes` : ''}{' '}
                          {p.colors?.length ? `· ${p.colors.length} colors` : ''}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditProduct(p)}
                      className="rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-1.5 text-xs font-semibold text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteProduct(p.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCEBEF] text-[#6B7D88] hover:text-[#B42318] cursor-pointer"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES & SUBCATEGORIES */}
        {activeTab === 'categories' && (
          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleSaveCategory}
              className="space-y-4 rounded-2xl border border-[#DCEBEF] bg-white p-6 lg:col-span-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-[#0E171D] uppercase">
                  {editingCatId ? 'Edit Category' : 'Add Category'}
                </h2>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="text-xs font-semibold text-[#118A9B] underline cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0E171D] uppercase">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Winter High-Necks"
                  className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-[#0E171D] uppercase">
                  Cover Image
                </span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="url"
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="Image URL or upload..."
                    className="min-h-[40px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-xs"
                  />
                  <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#118A9B] bg-[#EEF9FB] px-3 text-xs font-bold text-[#118A9B]">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    <span>{uploadingCatImg ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCatFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-[#0E171D] uppercase">
                  Subcategories
                </span>
                <div className="mt-1.5 flex gap-2">
                  <input
                    type="text"
                    value={catSubInput}
                    onChange={(e) => setCatSubInput(e.target.value)}
                    placeholder="e.g. Fleece Thermals"
                    className="min-h-[38px] flex-1 rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </div>

                {catSubs.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {catSubs.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 rounded-md border border-[#DCEBEF] bg-[#F5FAFB] px-2.5 py-1 text-xs font-medium text-[#0E171D]"
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() =>
                            setCatSubs((prev) => prev.filter((item) => item !== sub))
                          }
                          className="ml-1 text-[#6B7D88] hover:text-[#B42318] cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingCat}
                className="min-h-[44px] w-full rounded-lg bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-5 py-2.5 font-display text-sm font-bold text-white cursor-pointer"
              >
                {savingCat
                  ? 'Saving...'
                  : editingCatId
                  ? 'Update Category'
                  : 'Save Category'}
              </button>
            </form>

            <div className="space-y-3 lg:col-span-7">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#DCEBEF] bg-white p-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#DCEBEF]">
                      <ProductImage src={cat.image} alt={cat.name} className="h-full w-full" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-[#0E171D]">
                        {cat.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#546A76]">
                        {cat.subcategories.length > 0
                          ? cat.subcategories.join(' · ')
                          : 'No subcategories'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setCatName(cat.name);
                        setCatImage(cat.image);
                        setCatSubs(cat.subcategories);
                      }}
                      className="rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-1.5 text-xs font-semibold text-[#0E171D] hover:bg-[#E7F4F6] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCategory(cat.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCEBEF] text-[#6B7D88] hover:text-[#B42318] cursor-pointer"
                      aria-label={`Delete ${cat.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WEBSITE & PAYMENT SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Brand, Contact & Social */}
              <div className="space-y-4 rounded-2xl border border-[#DCEBEF] bg-white p-6">
                <h2 className="font-display text-lg font-extrabold text-[#0E171D] uppercase">
                  Website Name, Contact &amp; Social Links
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#0E171D] uppercase">
                      Website Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.brandName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          brandName: e.target.value,
                        }))
                      }
                      className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0E171D] uppercase">
                      Header Short Title
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.shortMark}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          shortMark: e.target.value,
                        }))
                      }
                      className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#0E171D] uppercase">
                      Domain Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.domain}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          domain: e.target.value,
                        }))
                      }
                      className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0E171D] uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={settingsForm.email}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[#0E171D] uppercase">
                      Primary WhatsApp &amp; Call Number
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.primaryPhone}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          primaryPhone: e.target.value,
                        }))
                      }
                      placeholder="0315-5588282"
                      className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0E171D] uppercase">
                      Secondary Phone Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.secondaryPhone}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          secondaryPhone: e.target.value,
                        }))
                      }
                      placeholder="0321-8026012"
                      className="mt-1.5 min-h-[40px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 py-2 text-sm text-[#0E171D]"
                    />
                  </div>
                </div>

                <div className="border-t border-[#EBF3F5] pt-4 space-y-3">
                  <p className="font-display text-xs font-extrabold text-[#118A9B] uppercase">
                    Social Media Links
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#0E171D]">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={settingsForm.instagramUrl}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            instagramUrl: e.target.value,
                          }))
                        }
                        className="mt-1 min-h-[38px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0E171D]">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={settingsForm.handle}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            handle: e.target.value,
                          }))
                        }
                        className="mt-1 min-h-[38px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#0E171D]">
                        TikTok URL
                      </label>
                      <input
                        type="url"
                        value={settingsForm.tiktokUrl}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            tiktokUrl: e.target.value,
                          }))
                        }
                        className="mt-1 min-h-[38px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0E171D]">
                        TikTok Handle
                      </label>
                      <input
                        type="text"
                        value={settingsForm.tiktokHandle}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            tiktokHandle: e.target.value,
                          }))
                        }
                        className="mt-1 min-h-[38px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0E171D]">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={settingsForm.facebookUrl}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          facebookUrl: e.target.value,
                        }))
                      }
                      className="mt-1 min-h-[38px] w-full rounded-lg border border-[#D4E3E7] bg-[#F5FAFB] px-3 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods & Bank / Wallet Accounts */}
              <div className="space-y-4 rounded-2xl border border-[#DCEBEF] bg-white p-6">
                <h2 className="font-display text-lg font-extrabold text-[#0E171D] uppercase">
                  Payment Methods &amp; Bank Details
                </h2>

                {/* COD Toggle */}
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#DCEBEF] bg-[#F5FAFB] p-4">
                  <div>
                    <p className="font-display text-sm font-bold text-[#0E171D]">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-xs text-[#546A76]">
                      Show or hide Cash on Delivery at checkout
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.codEnabled}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        codEnabled: e.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[#118A9B]"
                  />
                </label>

                {/* Easypaisa */}
                <div className="space-y-3 rounded-xl border border-[#DCEBEF] bg-[#F5FAFB] p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-[#0E171D]">
                        Easypaisa
                      </p>
                      <p className="text-xs text-[#546A76]">
                        Enable or disable Easypaisa option
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.easypaisaEnabled}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          easypaisaEnabled: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-[#118A9B]"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      value={settingsForm.easypaisaAccountTitle}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          easypaisaAccountTitle: e.target.value,
                        }))
                      }
                      placeholder="Easypaisa Account Name"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.easypaisaNumber}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          easypaisaNumber: e.target.value,
                        }))
                      }
                      placeholder="Easypaisa Number"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                  </div>
                </div>

                {/* JazzCash */}
                <div className="space-y-3 rounded-xl border border-[#DCEBEF] bg-[#F5FAFB] p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-[#0E171D]">
                        JazzCash
                      </p>
                      <p className="text-xs text-[#546A76]">
                        Enable or disable JazzCash option
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.jazzcashEnabled}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          jazzcashEnabled: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-[#118A9B]"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      value={settingsForm.jazzcashAccountTitle}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          jazzcashAccountTitle: e.target.value,
                        }))
                      }
                      placeholder="JazzCash Account Name"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.jazzcashNumber}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          jazzcashNumber: e.target.value,
                        }))
                      }
                      placeholder="JazzCash Number"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="space-y-3 rounded-xl border border-[#DCEBEF] bg-[#F5FAFB] p-4">
                  <label className="flex cursor-pointer items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-[#0E171D]">
                        Online Bank Transfer
                      </p>
                      <p className="text-xs text-[#546A76]">
                        Enable or disable Bank Transfer option
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.bankEnabled}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          bankEnabled: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-[#118A9B]"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <input
                      type="text"
                      value={settingsForm.bankName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          bankName: e.target.value,
                        }))
                      }
                      placeholder="Bank Name (e.g. Meezan Bank)"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.bankAccountTitle}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          bankAccountTitle: e.target.value,
                        }))
                      }
                      placeholder="Account Title"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.bankAccountNumber}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          bankAccountNumber: e.target.value,
                        }))
                      }
                      placeholder="Account Number"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.bankIban}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          bankIban: e.target.value,
                        }))
                      }
                      placeholder="IBAN (Optional)"
                      className="min-h-[38px] rounded-lg border border-[#D4E3E7] bg-white px-3 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="min-h-[46px] rounded-xl bg-gradient-to-r from-[#118A9B] to-[#23B5C8] px-8 py-3 font-display text-sm font-bold text-white shadow-sm transition-all hover:from-[#0E7483] hover:to-[#179EB0] disabled:opacity-60 cursor-pointer"
              >
                {savingSettings ? 'Saving Settings...' : 'Save Website Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
