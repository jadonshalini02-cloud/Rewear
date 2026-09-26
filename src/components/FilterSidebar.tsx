import React from 'react';
import { SlidersHorizontal, RotateCcw, MapPin, Check } from 'lucide-react';
import { Category, Condition } from '../types';

export interface FilterState {
  category: string;
  subcategory: string;
  condition: string;
  size: string;
  brand: string;
  location: string;
  minVal: number;
  maxVal: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  onNearMe?: () => void;
  isNearMeActive?: boolean;
}

const CATEGORIES: Category[] = ['Women', 'Men', 'Unisex', 'Kids'];

const SUBCATEGORIES: Record<string, string[]> = {
  All: ['Tops', 'Shirts', 'T-Shirts', 'Dresses', 'Jeans', 'Trousers', 'Jackets', 'Coats', 'Sweaters', 'Skirts', 'Ethnic Wear', 'Activewear', 'Accessories', 'Shoes'],
  Women: ['Dresses', 'Ethnic Wear', 'Tops', 'Skirts', 'Jackets', 'Jeans', 'Sweaters', 'Shoes', 'Accessories'],
  Men: ['Shirts', 'T-Shirts', 'Jeans', 'Jackets', 'Trousers', 'Sweaters', 'Shoes', 'Activewear'],
  Unisex: ['Jackets', 'T-Shirts', 'Sweaters', 'Jeans', 'Accessories', 'Shoes'],
  Kids: ['Tops', 'Dresses', 'T-Shirts', 'Trousers', 'Jackets', 'Ethnic Wear'],
};

const CONDITIONS: Condition[] = ['Like New', 'Excellent', 'Good', 'Fair'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const TOP_BRANDS = ["Levi's", 'Zara', 'Uniqlo', 'Fabindia', 'Nike', 'H&M Conscious', 'Handloom Artisans', 'Patagonia'];
const TOP_CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Kochi', 'Chennai', 'Kolkata'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  onNearMe,
  isNearMeActive,
}) => {
  const currentSubcats = SUBCATEGORIES[filters.category] || SUBCATEGORIES['All'];

  return (
    <aside className="w-full bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
          <SlidersHorizontal className="w-4 h-4 text-[#315C3A]" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stone-500 hover:text-[#315C3A] font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Near Me Quick Action */}
      {onNearMe && (
        <button
          onClick={onNearMe}
          className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isNearMeActive
              ? 'bg-[#E8F1E8] border-[#315C3A] text-[#315C3A]'
              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-[#E8F1E8]/50'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#315C3A]" />
          <span>{isNearMeActive ? 'Showing Clothes Near You' : 'Find Clothes Near Me'}</span>
        </button>
      )}

      {/* Category Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Category</label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onChange({ ...filters, category: 'All', subcategory: 'All' })}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
              filters.category === 'All'
                ? 'bg-[#315C3A] text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Clothes
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat, subcategory: 'All' })}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                filters.category === cat
                  ? 'bg-[#315C3A] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Subcategory</label>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ ...filters, subcategory: 'All' })}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filters.subcategory === 'All'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {currentSubcats.map((sub) => (
            <button
              key={sub}
              onClick={() => onChange({ ...filters, subcategory: sub })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filters.subcategory === sub
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Condition</label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
            <input
              type="radio"
              name="condition"
              checked={filters.condition === 'All'}
              onChange={() => onChange({ ...filters, condition: 'All' })}
              className="accent-[#315C3A]"
            />
            <span>All Conditions</span>
          </label>
          {CONDITIONS.map((cond) => (
            <label key={cond} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="radio"
                name="condition"
                checked={filters.condition === cond}
                onChange={() => onChange({ ...filters, condition: cond })}
                className="accent-[#315C3A]"
              />
              <span>{cond}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Size</label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ ...filters, size: 'All' })}
            className={`w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              filters.size === 'All'
                ? 'bg-[#315C3A] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => onChange({ ...filters, size: sz })}
              className={`h-9 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                filters.size === sz
                  ? 'bg-[#315C3A] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Location / City */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">City</label>
        <select
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#315C3A]"
        >
          <option value="All">All Indian Cities</option>
          {TOP_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Estimated Swap Value Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold uppercase tracking-wider text-stone-500">Swap Value</label>
          <span className="font-serif font-semibold text-stone-900">Up to ₹{filters.maxVal.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={500}
          max={6000}
          step={250}
          value={filters.maxVal}
          onChange={(e) => onChange({ ...filters, maxVal: Number(e.target.value) })}
          className="w-full accent-[#315C3A] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-stone-400">
          <span>₹500</span>
          <span>₹6,000+</span>
        </div>
      </div>
    </aside>
  );
};
