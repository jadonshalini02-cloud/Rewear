import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ArrowRightLeft,
  Shirt,
  Heart,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Calculator,
  ChevronRight,
  TrendingUp,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { UserStats, ClothingItem, SwapRequest } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ClothingCard } from '../../components/ClothingCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { SwapValueCalculatorModal } from '../../components/SwapValueCalculatorModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentListings, setRecentListings] = useState<ClothingItem[]>([]);
  const [pendingSwaps, setPendingSwaps] = useState<SwapRequest[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const statsData = await api.getUserStats();
        setStats(statsData);

        const itemsRes = await api.getItems({ ownerId: user?.id, limit: 4 });
        setRecentListings(itemsRes.items || []);

        const swapsRes = await api.getSwaps({ type: 'incoming', status: 'PENDING' });
        setPendingSwaps(swapsRes.swaps || []);

        const recRes = await api.getItems({ limit: 4, sort: 'popular' });
        setRecommendedItems(recRes.items.filter((i) => i.ownerId !== user?.id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-stone-500 font-medium">Loading your sustainable wardrobe hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-[#F7F4ED] via-white to-[#E8F1E8]/40 border border-stone-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Member Dashboard</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F1E8] text-[#315C3A] text-[10px] font-bold">
              Active Swapper
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {user?.location || 'India'} • {stats?.completedSwaps || 0} garments diverted from textile waste
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="px-4 py-2.5 rounded-full bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-[#315C3A]" />
            <span>Value Calculator</span>
          </button>
          <Link
            to="/add-clothes"
            className="px-5 py-2.5 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>List an Item</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/my-listings"
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-[#315C3A]/50 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-[#315C3A]">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">My Wardrobe</span>
            <Shirt className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900 mt-3">
            {stats?.activeListings || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Available for Swap</p>
        </Link>

        <Link
          to="/swap-requests"
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-[#315C3A]/50 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-[#315C3A]">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Pending Swaps</span>
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900 mt-3">
            {stats?.pendingRequests || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Awaiting Response</p>
        </Link>

        <Link
          to="/swap-requests?tab=completed"
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-[#315C3A]/50 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Completed</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900 mt-3">
            {stats?.completedSwaps || 0}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            ~{((stats?.completedSwaps || 0) * 2.5).toFixed(1)}kg CO₂ Saved
          </p>
        </Link>

        <Link
          to="/favorites"
          className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-rose-300 transition-all group"
        >
          <div className="flex items-center justify-between text-stone-400 group-hover:text-rose-600">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Saved</span>
            <Heart className="w-5 h-5" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900 mt-3">
            {stats?.favoritedCount || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Favorites Watchlist</p>
        </Link>
      </div>

      {/* Pending Swaps Review Banner if any */}
      {pendingSwaps.length > 0 && (
        <section className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Incoming Swap Requests ({pendingSwaps.length})
              </h3>
            </div>
            <Link
              to="/swap-requests"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>View All Requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSwaps.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.offeredItem?.images[0]}
                    alt="Offered"
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {req.initiator?.name} wants to swap for your{' '}
                      <strong>{req.requestedItem?.title}</strong>
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      Offering: {req.offeredItem?.title} (₹{req.offeredItem?.estimatedValue})
                    </p>
                  </div>
                </div>

                <Link
                  to="/swap-requests"
                  className="px-3.5 py-1.5 rounded-full bg-[#315C3A] text-white text-xs font-semibold shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Recent Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">My Wardrobe Listings</h3>
            <p className="text-xs text-stone-500">Clothes you have currently uploaded for swap exchange</p>
          </div>
          <Link
            to="/my-listings"
            className="text-xs font-bold text-[#315C3A] hover:underline flex items-center gap-1"
          >
            <span>Manage All ({stats?.totalListings || 0})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#F7F4ED]/60 border border-stone-200/80 text-center space-y-3">
            <Shirt className="w-10 h-10 text-stone-400 mx-auto" />
            <h4 className="font-serif font-bold text-base text-stone-900">No clothes listed yet</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Upload your clean, wearable clothes to start proposing and receiving barter swaps.
            </p>
            <Link
              to="/add-clothes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#315C3A] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>List an Item Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recentListings.map((item) => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended for You */}
      {recommendedItems.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-stone-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D6A756]" />
              <h3 className="font-serif text-2xl font-bold text-stone-900">Recommended for Swap</h3>
            </div>
            <Link
              to="/browse"
              className="text-xs font-bold text-[#315C3A] hover:underline flex items-center gap-1"
            >
              <span>Explore Marketplace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {recommendedItems.map((item) => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <SwapValueCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
