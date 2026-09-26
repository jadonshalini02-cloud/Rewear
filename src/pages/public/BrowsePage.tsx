import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, MapPin, X, ArrowUpDown, Sparkles, Filter } from 'lucide-react';
import { ClothingItem } from '../../types';
import { api } from '../../services/api';
import { ClothingCard } from '../../components/ClothingCard';
import { FilterSidebar, FilterState } from '../../components/FilterSidebar';
import { SearchBar } from '../../components/SearchBar';
import { SkeletonCard, EmptyState } from '../../components/LoadingSpinner';
import { SwapModal } from '../../components/SwapModal';
import { useAuth } from '../../context/AuthContext';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSwapItem, setSelectedSwapItem] = useState<ClothingItem | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isNearMeActive, setIsNearMeActive] = useState<boolean>(false);

  // Filter State initialized from URL params if present
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || 'All',
    subcategory: searchParams.get('subcategory') || 'All',
    condition: searchParams.get('condition') || 'All',
    size: searchParams.get('size') || 'All',
    brand: searchParams.get('brand') || 'All',
    location: searchParams.get('location') || 'All',
    minVal: 0,
    maxVal: 6000,
  });

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number | undefined> = {
        search: searchQuery || undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        subcategory: filters.subcategory !== 'All' ? filters.subcategory : undefined,
        condition: filters.condition !== 'All' ? filters.condition : undefined,
        size: filters.size !== 'All' ? filters.size : undefined,
        brand: filters.brand !== 'All' ? filters.brand : undefined,
        location: filters.location !== 'All' ? filters.location : undefined,
        maxVal: filters.maxVal < 6000 ? filters.maxVal : undefined,
        sort: sortBy,
        page,
        limit: 12,
      };

      const res = await api.getItems(params);
      setItems(res.items || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalCount(res.pagination.total || 0);
    } catch (err) {
      console.error('Failed to fetch marketplace items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery, sortBy, filters, page]);

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      subcategory: 'All',
      condition: 'All',
      size: 'All',
      brand: 'All',
      location: 'All',
      minVal: 0,
      maxVal: 6000,
    });
    setSearchQuery('');
    setIsNearMeActive(false);
    setPage(1);
  };

  const handleNearMe = () => {
    if (user?.location) {
      const city = user.location.split(',')[0].trim();
      setFilters((prev) => ({ ...prev, location: city }));
      setIsNearMeActive(true);
      setPage(1);
    } else {
      // Fallback default city
      setFilters((prev) => ({ ...prev, location: 'Bangalore' }));
      setIsNearMeActive(true);
      setPage(1);
    }
  };

  const removeFilterTag = (key: keyof FilterState) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'maxVal' ? 6000 : 'All',
    }));
    if (key === 'location') setIsNearMeActive(false);
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.subcategory !== 'All' ||
    filters.condition !== 'All' ||
    filters.size !== 'All' ||
    filters.brand !== 'All' ||
    filters.location !== 'All' ||
    filters.maxVal < 6000 ||
    searchQuery.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Community Wardrobes</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1">
            Browse Clothes for Swap
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Discover {totalCount} authentic garments available for direct barter exchange.
          </p>
        </div>

        {/* Search Bar on Desktop & Mobile */}
        <div className="w-full md:w-96">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <FilterSidebar
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setPage(1);
            }}
            onReset={handleResetFilters}
            onNearMe={handleNearMe}
            isNearMeActive={isNearMeActive}
          />
        </div>

        {/* Main Grid Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
            {/* Mobile Filter Drawer Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors"
            >
              <Filter className="w-4 h-4 text-[#315C3A]" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            {/* Total Results Count */}
            <span className="text-xs text-stone-600 font-medium">
              Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> items
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-stone-50 border border-stone-200 text-stone-900 rounded-xl p-2 text-xs font-medium focus:ring-2 focus:ring-[#315C3A]"
              >
                <option value="newest">Newest Listed</option>
                <option value="popular">Most Popular</option>
                <option value="value_low_high">Swap Value: Low to High</option>
                <option value="value_high_low">Swap Value: High to Low</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-stone-400 font-medium">Active Filters:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F1E8] text-[#315C3A] text-xs font-medium">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
                  Category: {filters.category}
                  <button onClick={() => removeFilterTag('category')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.subcategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
                  Subcategory: {filters.subcategory}
                  <button onClick={() => removeFilterTag('subcategory')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.condition !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
                  Condition: {filters.condition}
                  <button onClick={() => removeFilterTag('condition')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.size !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
                  Size: {filters.size}
                  <button onClick={() => removeFilterTag('size')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.location !== 'All' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
                  City: {filters.location}
                  <button onClick={() => removeFilterTag('location')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.maxVal < 6000 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-medium">
                  Under ₹{filters.maxVal.toLocaleString()}
                  <button onClick={() => removeFilterTag('maxVal')} className="hover:text-stone-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Clothing Items Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="No clothes found"
              description="No clothing items matched your active search and filter criteria. Try broadening your filters or list your own clothes for swap!"
              actionText="Reset All Filters"
              onAction={handleResetFilters}
              secondaryActionText="List an Item"
              onSecondaryAction={() => (window.location.href = '/add-clothes')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onRequestSwap={(it) => setSelectedSwapItem(it)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-stone-200 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-stone-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs lg:hidden overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-full text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
              onReset={handleResetFilters}
              onNearMe={() => {
                handleNearMe();
                setIsMobileFilterOpen(false);
              }}
              isNearMeActive={isNearMeActive}
            />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {selectedSwapItem && (
        <SwapModal
          targetItem={selectedSwapItem}
          isOpen={!!selectedSwapItem}
          onClose={() => setSelectedSwapItem(null)}
        />
      )}
    </div>
  );
};
