import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  Sparkles,
  X,
  Plus,
  ArrowLeft,
  Calculator,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Category, Condition } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SwapValueCalculatorModal } from '../../components/SwapValueCalculatorModal';

const CATEGORIES: Category[] = ['Women', 'Men', 'Unisex', 'Kids'];
const SUBCATEGORIES: Record<string, string[]> = {
  Women: ['Dresses', 'Ethnic Wear', 'Tops', 'Skirts', 'Jackets', 'Jeans', 'Sweaters', 'Shoes', 'Accessories'],
  Men: ['Shirts', 'T-Shirts', 'Jeans', 'Jackets', 'Trousers', 'Sweaters', 'Shoes', 'Activewear'],
  Unisex: ['Jackets', 'T-Shirts', 'Sweaters', 'Jeans', 'Accessories', 'Shoes'],
  Kids: ['Tops', 'Dresses', 'T-Shirts', 'Trousers', 'Jackets', 'Ethnic Wear'],
};

const CONDITIONS: Condition[] = ['Like New', 'Excellent', 'Good', 'Fair'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COMMON_BRANDS = ["Levi's", 'Zara', 'Uniqlo', 'Fabindia', 'Nike', 'H&M Conscious', 'Handloom Artisans', 'Patagonia', 'Other Brand'];

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Vintage Denim',
    url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Linen Dress',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Handloom Kurta',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Wool Sweater',
    url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Leather Jacket',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  },
];

export const AddEditClothesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<Category>('Women');
  const [subcategory, setSubcategory] = useState<string>('Dresses');
  const [brand, setBrand] = useState<string>("Levi's");
  const [customBrand, setCustomBrand] = useState<string>('');
  const [size, setSize] = useState<string>('M');
  const [condition, setCondition] = useState<Condition>('Excellent');
  const [color, setColor] = useState<string>('Indigo Blue');
  const [material, setMaterial] = useState<string>('100% Organic Cotton');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [estimatedValue, setEstimatedValue] = useState<number>(2200);
  const [location, setLocation] = useState<string>(user?.location || 'Bangalore, India');
  const [images, setImages] = useState<string[]>([SAMPLE_PHOTO_PRESETS[0].url]);
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['vintage', 'sustainable', 'casual']);

  const [isLoading, setIsLoading] = useState<boolean>(isEditing);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchExistingItem = async () => {
      try {
        setIsLoading(true);
        const res = await api.getItemById(id);
        const it = res.item;
        setTitle(it.title);
        setDescription(it.description);
        setCategory(it.category);
        setSubcategory(it.subcategory || '');
        if (COMMON_BRANDS.includes(it.brand)) {
          setBrand(it.brand);
        } else {
          setBrand('Other Brand');
          setCustomBrand(it.brand);
        }
        setSize(it.size);
        setCondition(it.condition);
        setColor(it.color || '');
        setMaterial(it.material || '');
        setOriginalPrice(it.originalPrice ? String(it.originalPrice) : '');
        setEstimatedValue(it.estimatedValue);
        setLocation(it.location);
        setImages(it.images || []);
        setTags(it.tags || []);
      } catch (err) {
        setError('Failed to load item for editing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingItem();
  }, [id, isEditing]);

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    const subcats = SUBCATEGORIES[newCat] || [];
    if (subcats.length > 0) {
      setSubcategory(subcats[0]);
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddPresetPhoto = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, WEBP, GIF, or AVIF image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Each image must be smaller than 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read this image file.'));
        reader.readAsDataURL(file);
      });
      const uploaded = await api.uploadImage(dataUrl, file.name);
      setImages((prev) => (prev.includes(uploaded.url) ? prev : [...prev, uploaded.url]));
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAutoEstimate = async () => {
    try {
      const activeBrand = brand === 'Other Brand' ? customBrand || 'Standard' : brand;
      const res = await api.estimateValue({
        category,
        subcategory,
        brand: activeBrand,
        condition,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
      });
      setEstimatedValue(res.estimatedValue);
    } catch (err) {
      console.error('Auto estimate error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description for the garment.');
      return;
    }
    if (images.length === 0) {
      setError('Please upload or select at least one garment photo.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const activeBrand = brand === 'Other Brand' ? customBrand || 'Unbranded' : brand;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory,
        brand: activeBrand,
        size,
        condition,
        color: color.trim() || undefined,
        material: material.trim() || undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        estimatedValue,
        images,
        tags,
        location: location.trim() || 'Bangalore, India',
      };

      if (isEditing && id) {
        await api.updateItem(id, payload);
      } else {
        await api.createItem(payload);
      }

      navigate('/my-listings');
    } catch (err: any) {
      setError(err.message || 'Failed to save clothing listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-stone-500 font-medium">Loading garment data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/my-listings"
            className="p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
              {isEditing ? 'Edit Clothing Listing' : 'List an Item for Swap'}
            </h1>
            <p className="text-xs text-stone-500">
              {isEditing
                ? 'Update garment details and valuation'
                : 'Turn your unused clothes into fresh style pieces with zero money spent'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. PHOTO GALLERY & PRESETS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Garment Photos *</h3>
            <p className="text-xs text-stone-500">
              Add clear, well-lit photos showing front, back, and any relevant tags or details.
            </p>
          </div>

          {/* Active Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-4/5 rounded-2xl overflow-hidden border border-stone-200 group bg-stone-50"
              >
                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-stone-900/80 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E8F1E8] text-[#315C3A] text-xs font-semibold cursor-pointer hover:bg-[#dcebdc] transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading…' : 'Upload from device'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="sr-only"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
            <span className="text-[11px] text-stone-400">JPG, PNG, WEBP, GIF, or AVIF · max 10MB</span>
          </div>

          {/* Preset Stock Dropdowns for Instant Demo Fill */}
          <div className="pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Or pick sample aesthetic garment photos:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddPresetPhoto(p.url)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#E8F1E8] text-stone-700 hover:text-[#315C3A] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. CORE DETAILS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <h3 className="font-serif font-bold text-lg text-stone-900">Garment Information</h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vintage Levi's 501 Trucker Denim Jacket"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as Category)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Subcategory *
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
                >
                  {(SUBCATEGORIES[category] || []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand, Size, Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Brand *
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
                >
                  {COMMON_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {brand === 'Other Brand' && (
                  <input
                    type="text"
                    placeholder="Enter custom brand name"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="mt-2 w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Size *
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
                >
                  {SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fabric Material & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Fabric / Material
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Khadi Cotton, Pure Linen, Denim"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  Color / Pattern
                </label>
                <input
                  type="text"
                  placeholder="e.g. Olive Green, Floral Print, Classic Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe fit, feel, how often it was worn, and any specific styling tips or trade preferences..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
              />
            </div>
          </div>
        </div>

        {/* 3. FAIR SWAP VALUATION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Fair Swap Valuation</h3>
              <p className="text-xs text-stone-500">
                Helps other swappers gauge equitable barter trades across brands
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#E8F1E8] text-[#315C3A] text-xs font-semibold hover:bg-[#315C3A] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer w-fit"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Full Valuation Calculator</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Original Retail Price (₹) <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 3999"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Estimated Swap Value (₹) *
                </label>
                <button
                  type="button"
                  onClick={handleAutoEstimate}
                  className="text-[11px] font-semibold text-[#315C3A] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#D6A756]" />
                  <span>Auto-Estimate</span>
                </button>
              </div>
              <input
                type="number"
                required
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-serif font-bold text-stone-900"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Style Tags / Keywords
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type tag (e.g. vintage, summer, formal) and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs text-stone-900"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium"
                >
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/my-listings"
            className="px-6 py-3 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="border-white" />
                <span>Publishing Garment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'List Item for Swap'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Value Calculator Modal */}
      <SwapValueCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyValue={(val) => setEstimatedValue(val)}
        initialValues={{
          category,
          subcategory,
          brand,
          condition,
        }}
      />
    </div>
  );
};
