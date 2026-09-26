import React, { useState, useEffect } from 'react';
import { Heart, ArrowRightLeft, Sparkles, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClothingItem } from '../../types';
import { api } from '../../services/api';
import { ClothingCard } from '../../components/ClothingCard';
import { SwapModal } from '../../components/SwapModal';
import { SkeletonCard, EmptyState } from '../../components/LoadingSpinner';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSwapItem, setSelectedSwapItem] = useState<ClothingItem | null>(null);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFavorites();
      setFavorites(res.favorites || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (itemId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      setFavorites((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Saved Wardrobes</span>
          <h1 className="font-serif text-3xl font-extrabold text-stone-900 mt-1">My Saved Favorites</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Garments you have bookmarked for potential barter exchange.
          </p>
        </div>

        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315C3A] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Browse More Clothes</span>
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your favorites list is empty"
          description="Click the heart icon on any garment across the marketplace to bookmark pieces you'd love to swap for."
          actionText="Explore Clothes"
          actionHref="/browse"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <ClothingCard
              key={item.id}
              item={{ ...item, isFavorited: true }}
              onRequestSwap={(it) => setSelectedSwapItem(it)}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}

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
