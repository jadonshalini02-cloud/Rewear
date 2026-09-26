import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Repeat, Tag, Sparkles } from 'lucide-react';
import { ClothingItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ClothingCardProps {
  item: ClothingItem;
  onRequestSwap?: (item: ClothingItem) => void;
  onFavoriteToggle?: (itemId: string, isFavorited: boolean) => void;
  showMatchReason?: boolean;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onRequestSwap,
  onFavoriteToggle,
  showMatchReason = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState<boolean>(!!item.isFavorited);
  const [isFavLoading, setIsFavLoading] = useState<boolean>(false);

  const isOwner = user?.id === item.ownerId;
  const isAvailable = item.status === 'AVAILABLE';

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setIsFavLoading(true);
      if (isFavorited) {
        await api.removeFavorite(item.id);
        setIsFavorited(false);
        onFavoriteToggle?.(item.id, false);
      } else {
        await api.addFavorite(item.id);
        setIsFavorited(true);
        onFavoriteToggle?.(item.id, true);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    } finally {
      setIsFavLoading(false);
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Like New':
        return 'bg-[#F4DDD4] text-[#C66B4F] border-[#C66B4F]/30';
      case 'Excellent':
        return 'bg-stone-100 text-stone-800 border-stone-300';
      case 'Good':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'Fair':
        return 'bg-stone-50 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getStatusBadge = () => {
    if (item.status === 'PENDING_SWAP') {
      return (
        <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider font-bold bg-[#1A1A1A] text-amber-300 border border-amber-400/40">
          In Swap
        </span>
      );
    }
    if (item.status === 'SWAPPED') {
      return (
        <span className="px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider font-bold bg-stone-200 text-stone-600 border border-stone-300">
          Archived
        </span>
      );
    }
    return null;
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xs border border-black/8 overflow-hidden shadow-none hover:shadow-md transition-all duration-300 hover:border-[#C66B4F]/50">
      {/* Image Container */}
      <Link to={`/item/${item.id}`} className="relative aspect-3/4 w-full overflow-hidden bg-[#E2E0D8] block">
        <img
          src={item.images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'}
          alt={item.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Status or Condition Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {getStatusBadge()}
          <span className={`px-2 py-0.5 rounded-xs text-[9px] uppercase tracking-[0.18em] font-bold border backdrop-blur-xs ${getConditionColor(item.condition)}`}>
            {item.condition}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isFavLoading}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-xs flex items-center justify-center transition-all duration-200 border border-black/10 cursor-pointer ${
            isFavorited
              ? 'bg-[#1A1A1A] text-[#C66B4F]'
              : 'bg-white/90 text-stone-600 hover:text-[#C66B4F] hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-[#C66B4F]' : ''}`} />
        </button>

        {/* Match Reason Banner if suggested */}
        {showMatchReason && item.matchReason && (
          <div className="absolute bottom-0 inset-x-0 bg-[#1A1A1A]/85 p-2.5 text-white text-[11px] flex items-center gap-1.5 backdrop-blur-xs border-t border-white/10">
            <Sparkles className="w-3 h-3 text-[#C66B4F] shrink-0" />
            <span className="font-medium truncate tracking-wide">{item.matchReason}</span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand and Size Header */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="font-bold uppercase tracking-[0.18em] text-[#C66B4F] truncate max-w-[60%] text-[10px]">
              {item.brand}
            </span>
            <span className="bg-[#F9F7F2] text-stone-700 font-semibold px-1.5 py-0.5 rounded-xs border border-black/5 text-[10px] tracking-wider uppercase">
              {item.size}
            </span>
          </div>

          {/* Title */}
          <Link to={`/item/${item.id}`} className="block mt-0.5">
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A] line-clamp-1 group-hover:text-[#C66B4F] transition-colors leading-snug">
              {item.title}
            </h3>
          </Link>

          {/* Location & Category Sub-info */}
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-500">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              {item.location.split(',')[0]}
            </span>
            <span>•</span>
            <span className="truncate">{item.subcategory || item.category}</span>
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-stone-400 block uppercase tracking-widest font-semibold">Value</span>
            <span className="font-serif font-bold text-[#1A1A1A] text-sm">
              ₹{item.estimatedValue.toLocaleString()}
            </span>
          </div>

          {onRequestSwap && isAvailable && !isOwner ? (
            <button
              onClick={() => onRequestSwap(item)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xs bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#C66B4F] transition-colors shadow-none cursor-pointer"
            >
              <Repeat className="w-3 h-3" />
              <span>Swap</span>
            </button>
          ) : (
            <Link
              to={`/item/${item.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#F9F7F2] border border-black/8 text-stone-700 text-[10px] uppercase tracking-wider font-bold hover:bg-[#1A1A1A] hover:text-white transition-colors"
            >
              <span>View</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
