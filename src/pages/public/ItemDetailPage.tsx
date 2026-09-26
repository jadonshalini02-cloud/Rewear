import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ArrowRightLeft,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Flag,
  Share2,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronLeft,
  Calculator,
  User,
  Star,
  Check,
} from 'lucide-react';
import { ClothingItem, ValueEstimateResult } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClothingCard } from '../../components/ClothingCard';
import { SwapModal } from '../../components/SwapModal';
import { ReportModal } from '../../components/ReportModal';
import { LoadingSpinner, SkeletonCard } from '../../components/LoadingSpinner';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [similarItems, setSimilarItems] = useState<ClothingItem[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<ClothingItem[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchItemDetails = async () => {
      try {
        setIsLoading(true);
        const data = await api.getItemById(id);
        setItem(data.item);
        setIsFavorited(!!data.item.isFavorited);
        setSimilarItems(data.similarItems || []);
        setRecommendedMatches((data as any).potentialMatches || (data as any).recommendedMatches || []);
        setActiveImageIndex(0);
      } catch (err) {
        console.error('Failed to load item:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItemDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-stone-500 font-medium">Loading garment details & swap history...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">Garment Not Found</h2>
        <p className="text-sm text-stone-600">This item may have been swapped or removed by the owner.</p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#315C3A] text-white text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Browse Available Clothes</span>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === item.ownerId;
  const isAvailable = item.status === 'AVAILABLE';

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await api.removeFavorite(item.id);
        setIsFavorited(false);
      } else {
        await api.addFavorite(item.id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isOwner) return;

    try {
      const res = await api.createConversation({
        participantId: item.ownerId,
        itemId: item.id,
      });
      navigate(`/chat?convId=${res.conversation.id}`);
    } catch (err) {
      navigate('/chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs flex items-center gap-1.5 px-3 cursor-pointer"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-[#315C3A]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
          </button>

          {!isOwner && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-full border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 text-xs flex items-center gap-1 px-3 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Item Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 aspect-4/5 shadow-xs">
            <img
              src={item.images[activeImageIndex] || item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Condition Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-stone-900 shadow-sm border border-stone-200 backdrop-blur-xs">
                {item.condition} Condition
              </span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/95 text-stone-600 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* Thumbnails if multiple images */}
          {item.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#315C3A] ring-2 ring-[#315C3A]/30' : 'border-stone-200'
                  }`}
                >
                  <img src={img} alt={`${item.title} angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details & Swap Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div className="space-y-2 pb-5 border-b border-stone-200/80">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="uppercase font-bold tracking-wider text-[#315C3A]">{item.brand}</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {item.location}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {item.title}
            </h1>

            {/* Price & Value Badge */}
            <div className="flex items-baseline gap-3 pt-2">
              <div>
                <span className="text-xs uppercase font-bold text-stone-400 block">Fair Swap Value</span>
                <span className="font-serif text-3xl font-extrabold text-stone-900">
                  ₹{item.estimatedValue.toLocaleString()}
                </span>
              </div>
              {item.originalPrice && (
                <div className="text-xs text-stone-500">
                  <span>Retail Price: </span>
                  <span className="line-through">₹{item.originalPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Garment Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Size</span>
              <span className="text-sm font-bold text-stone-900">{item.size}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Category</span>
              <span className="text-sm font-bold text-stone-900">{item.category}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Condition</span>
              <span className="text-sm font-bold text-stone-900">{item.condition}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Material</span>
              <span className="text-sm font-bold text-stone-900 truncate block">{item.material || 'Quality Blend'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Garment Description</h3>
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="pt-4 border-t border-stone-200/80 space-y-3">
            {isOwner ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                You listed this item in your wardrobe. You can manage or edit it from your{' '}
                <Link to="/my-listings" className="underline font-bold">
                  wardrobe listings
                </Link>
                .
              </div>
            ) : isAvailable ? (
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#315C3A] text-white text-sm font-bold hover:bg-[#25472c] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Propose Clothing Swap</span>
                </button>

                <button
                  onClick={handleStartChat}
                  className="py-3.5 px-6 rounded-full bg-white border border-stone-300 text-stone-800 text-sm font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-stone-600" />
                  <span>Message Owner</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium text-center">
                This item is currently {item.status === 'PENDING_SWAP' ? 'under negotiation' : 'already swapped'}.
              </div>
            )}
          </div>

          {/* Owner Profile Card */}
          {item.owner && (
            <div className="p-5 rounded-3xl bg-[#F7F4ED]/80 border border-stone-200/80 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Wardrobe Owner
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.owner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={item.owner.name}
                    className="w-12 h-12 rounded-full object-cover border border-stone-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 font-serif">{item.owner.name}</h4>
                    <p className="text-xs text-stone-500">{item.owner.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-bold text-stone-900 justify-end">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.owner.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                  <p className="text-[11px] text-stone-500">{item.owner.swapCount || 0} Successful Swaps</p>
                </div>
              </div>

              {item.owner.bio && (
                <p className="text-xs text-stone-600 italic pt-1 border-t border-stone-200/60">
                  "{item.owner.bio}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Fair Matches Section */}
      {recommendedMatches.length > 0 && (
        <section className="pt-12 border-t border-stone-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D6A756]" />
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                Recommended Swap Matches (~₹{item.estimatedValue.toLocaleString()})
              </h3>
            </div>
            <span className="text-xs text-stone-500">Clothes in the same fair barter bracket</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedMatches.map((m) => (
              <ClothingCard key={m.id} item={m} showMatchReason />
            ))}
          </div>
        </section>
      )}

      {/* Similar Items Section */}
      {similarItems.length > 0 && (
        <section className="pt-8 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-stone-900">Similar in {item.category}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarItems.map((s) => (
              <ClothingCard key={s.id} item={s} />
            ))}
          </div>
        </section>
      )}

      {/* Swap Modal */}
      <SwapModal
        targetItem={item}
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        onSuccess={() => {
          // Re-fetch item to update status if needed
        }}
      />

      {/* Report Modal */}
      <ReportModal
        reportedItemId={item.id}
        targetTitle={item.title}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
