import React, { useState } from 'react';
import { X, Calculator, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { ValueEstimateResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface SwapValueCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyValue?: (val: number) => void;
  initialValues?: {
    category?: string;
    subcategory?: string;
    brand?: string;
    condition?: string;
  };
}

const CATEGORIES = ['Women', 'Men', 'Unisex', 'Kids'];
const SUBCATEGORIES = [
  'Jackets',
  'Coats',
  'Dresses',
  'Ethnic Wear',
  'Jeans',
  'Trousers',
  'Sweaters',
  'Shirts',
  'Tops',
  'T-Shirts',
  'Skirts',
  'Shoes',
  'Activewear',
  'Accessories',
];
const CONDITIONS = ['Like New', 'Excellent', 'Good', 'Fair'];
const POPULAR_BRANDS = ["Levi's", 'Zara', 'Uniqlo', 'Fabindia', 'Nike', 'H&M Conscious', 'Handloom Artisans', 'Patagonia', 'Other Brand'];

export const SwapValueCalculatorModal: React.FC<SwapValueCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyValue,
  initialValues,
}) => {
  const [category, setCategory] = useState<string>(initialValues?.category || 'Women');
  const [subcategory, setSubcategory] = useState<string>(initialValues?.subcategory || 'Jackets');
  const [brand, setBrand] = useState<string>(initialValues?.brand || "Levi's");
  const [customBrand, setCustomBrand] = useState<string>('');
  const [condition, setCondition] = useState<string>(initialValues?.condition || 'Excellent');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [ageYears, setAgeYears] = useState<string>('1');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ValueEstimateResult | null>(null);

  if (!isOpen) return null;

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const activeBrand = brand === 'Other Brand' ? customBrand || 'Standard' : brand;
      const res = await api.estimateValue({
        category,
        subcategory,
        brand: activeBrand,
        condition,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        ageYears: ageYears ? Number(ageYears) : undefined,
      });
      setResult(res);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#F7F4ED] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F1E8] text-[#315C3A] flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">Fair Swap Value Estimator</h2>
              <p className="text-xs text-stone-500">Transparent, rule-based circular fashion benchmark</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCalculate} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800"
              >
                {SUBCATEGORIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800"
              >
                {POPULAR_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {brand === 'Other Brand' && (
                <input
                  type="text"
                  placeholder="Enter brand name"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="mt-2 w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs"
                />
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Original Price */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Original Retail Price (₹) <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 3499"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800"
              />
            </div>

            {/* Approximate Age */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Age in Years <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <select
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800"
              >
                <option value="1">&lt; 1 Year (Recent)</option>
                <option value="2">1 - 2 Years</option>
                <option value="3">3 - 4 Years</option>
                <option value="5">5+ Years (Vintage)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="border-white" />
                <span>Estimating Value...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D6A756]" />
                <span>Calculate Fair Swap Value</span>
              </>
            )}
          </button>

          {/* Results Breakdown */}
          {result && (
            <div className="p-4 rounded-2xl bg-[#E8F1E8]/50 border border-[#315C3A]/20 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#315C3A] block">
                    Estimated Swap Value
                  </span>
                  <span className="text-2xl font-serif font-extrabold text-stone-900">
                    ₹{result.estimatedValue.toLocaleString()}
                  </span>
                </div>
                {onApplyValue && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyValue(result.estimatedValue);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-full bg-[#315C3A] text-white text-xs font-semibold hover:bg-[#25472c] transition-colors cursor-pointer shadow-xs"
                  >
                    Apply to Listing
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-[#315C3A]/15 space-y-1.5 text-xs text-stone-700">
                <span className="font-semibold text-stone-900 block text-[11px] uppercase tracking-wider">
                  Transparent Calculation Steps:
                </span>
                {result.explanationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#315C3A] mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-stone-600 italic">
                * Note: This value is a fair barter estimate intended to facilitate balanced swaps and is not a cash purchase guarantee.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
