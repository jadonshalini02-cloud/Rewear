import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  Shirt,
  User,
  Check,
  Star,
} from 'lucide-react';
import { SwapRequest, SwapStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const SwapRequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTab = searchParams.get('tab') || 'incoming'; // 'incoming' | 'outgoing' | 'completed'

  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratingModalSwap, setRatingModalSwap] = useState<SwapRequest | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');

  const fetchSwaps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let params: { type?: 'incoming' | 'outgoing'; status?: SwapStatus } = {};

      if (activeTab === 'incoming') {
        params = { type: 'incoming' };
      } else if (activeTab === 'outgoing') {
        params = { type: 'outgoing' };
      } else if (activeTab === 'completed') {
        params = { status: 'COMPLETED' };
      }

      const res = await api.getSwaps(params);
      setSwaps(res.swaps || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch swap proposals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [activeTab]);

  const handleUpdateStatus = async (swapId: string, status: SwapStatus, note?: string) => {
    try {
      setActionLoadingId(swapId);
      await api.updateSwapStatus(swapId, status, note);
      fetchSwaps();
    } catch (err: any) {
      setError(err.message || `Failed to update swap status.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteSwapWithRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalSwap) return;

    try {
      setActionLoadingId(ratingModalSwap.id);
      await api.updateSwapStatus(ratingModalSwap.id, 'COMPLETED', ratingComment);
      setRatingModalSwap(null);
      fetchSwaps();
    } catch (err: any) {
      setError(err.message || 'Failed to complete swap.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenChat = async (swap: SwapRequest) => {
    const otherUserId = swap.initiatorId === user?.id ? swap.recipientId : swap.initiatorId;
    try {
      const res = await api.createConversation({
        participantId: otherUserId,
        itemId: swap.requestedItemId,
      });
      navigate(`/chat?convId=${res.conversation.id}`);
    } catch (err) {
      navigate('/chat');
    }
  };

  const getStatusBadge = (status: SwapStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Awaiting Decision
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Accepted • Coordinate Exchange
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Declined
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Cancelled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Swapped & Diverted!
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Barter Exchange Hub</span>
          <h1 className="font-serif text-3xl font-extrabold text-stone-900 mt-1">Swap Requests</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Track incoming barter proposals, send counter-offers, and coordinate clothing exchanges.
          </p>
        </div>

        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-all shadow-xs"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Find Clothes to Swap</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setSearchParams({ tab: 'incoming' })}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
            activeTab === 'incoming'
              ? 'border-[#315C3A] text-[#315C3A]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Incoming Proposals
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'outgoing' })}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
            activeTab === 'outgoing'
              ? 'border-[#315C3A] text-[#315C3A]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Outgoing Proposals
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'completed' })}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
            activeTab === 'completed'
              ? 'border-[#315C3A] text-[#315C3A]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Completed Swaps
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Swaps Feed */}
      {isLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-sm text-stone-500 font-medium">Fetching swap status...</p>
        </div>
      ) : swaps.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title={
            activeTab === 'incoming'
              ? 'No incoming swap requests'
              : activeTab === 'outgoing'
              ? 'No outgoing swap requests'
              : 'No completed swaps yet'
          }
          description={
            activeTab === 'incoming'
              ? 'When another conscious swapper proposes a trade for one of your wardrobe items, it will appear here.'
              : activeTab === 'outgoing'
              ? 'Browse the marketplace to find pieces you love and propose an exchange!'
              : 'Once you finalize a swap and exchange garments, they will be archived here celebrating your carbon savings.'
          }
          actionText="Browse Marketplace"
          actionHref="/browse"
        />
      ) : (
        <div className="space-y-6">
          {swaps.map((swap) => {
            const isIncoming = swap.recipientId === user?.id;
            const otherUser = isIncoming ? swap.initiator : swap.recipient;
            const diff = (swap.offeredItem?.estimatedValue || 0) - (swap.requestedItem?.estimatedValue || 0);

            return (
              <div
                key={swap.id}
                className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-6 animate-in fade-in duration-200"
              >
                {/* Proposal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={otherUser?.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        {isIncoming ? `Proposal from ${otherUser?.name}` : `Proposal sent to ${otherUser?.name}`}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {new Date(swap.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {otherUser?.location || 'India'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">{getStatusBadge(swap.status)}</div>
                </div>

                {/* Side-by-Side Comparison of the Two Garments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Offered Garment */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      {isIncoming ? 'They Offer:' : 'You Offer:'}
                    </span>
                    <div className="flex gap-3 items-center">
                      <img
                        src={swap.offeredItem?.images[0]}
                        alt={swap.offeredItem?.title}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <Link
                          to={`/item/${swap.offeredItemId}`}
                          className="text-xs font-bold text-stone-900 hover:text-[#315C3A] truncate block font-serif"
                        >
                          {swap.offeredItem?.title}
                        </Link>
                        <p className="text-[11px] text-stone-500">
                          {swap.offeredItem?.brand} • Size {swap.offeredItem?.size} • {swap.offeredItem?.condition}
                        </p>
                        <p className="text-xs font-semibold text-[#315C3A]">
                          Swap Value: ₹{swap.offeredItem?.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requested Garment */}
                  <div className="p-4 rounded-2xl bg-[#E8F1E8]/30 border border-[#315C3A]/20 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#315C3A] block">
                      {isIncoming ? 'In Exchange For Your:' : 'In Exchange For Their:'}
                    </span>
                    <div className="flex gap-3 items-center">
                      <img
                        src={swap.requestedItem?.images[0]}
                        alt={swap.requestedItem?.title}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <Link
                          to={`/item/${swap.requestedItemId}`}
                          className="text-xs font-bold text-stone-900 hover:text-[#315C3A] truncate block font-serif"
                        >
                          {swap.requestedItem?.title}
                        </Link>
                        <p className="text-[11px] text-stone-500">
                          {swap.requestedItem?.brand} • Size {swap.requestedItem?.size} • {swap.requestedItem?.condition}
                        </p>
                        <p className="text-xs font-semibold text-[#315C3A]">
                          Swap Value: ₹{swap.requestedItem?.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message or Context Note */}
                {swap.message && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 text-xs text-stone-700 italic">
                    "{swap.message}"
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenChat(swap)}
                    className="px-4 py-2 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                    <span>Chat with {otherUser?.name}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Incoming Pending Actions */}
                    {isIncoming && swap.status === 'PENDING' && (
                      <>
                        <button
                          disabled={actionLoadingId === swap.id}
                          onClick={() => handleUpdateStatus(swap.id, 'REJECTED')}
                          className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          disabled={actionLoadingId === swap.id}
                          onClick={() => handleUpdateStatus(swap.id, 'ACCEPTED')}
                          className="px-5 py-2 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Swap</span>
                        </button>
                      </>
                    )}

                    {/* Outgoing Pending Actions */}
                    {!isIncoming && swap.status === 'PENDING' && (
                      <button
                        disabled={actionLoadingId === swap.id}
                        onClick={() => handleUpdateStatus(swap.id, 'CANCELLED')}
                        className="px-4 py-2 rounded-full border border-stone-300 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Cancel Proposal
                      </button>
                    )}

                    {/* Accepted Swap -> Mark Completed Trigger */}
                    {swap.status === 'ACCEPTED' && (
                      <button
                        onClick={() => setRatingModalSwap(swap)}
                        className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Garments Exchanged</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete & Rate Modal */}
      {ratingModalSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCompleteSwapWithRating}
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-xl text-stone-900">Confirm Garment Exchange</h3>
              <p className="text-xs text-stone-600">
                You're confirming that both garments have been handed over or delivered. This will complete the swap and celebrate ~5.0 kg total CO₂ diversion!
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2 text-center">
                Rate your swap experience:
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRatingValue(s)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Optional note to the community:
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={2}
                placeholder="e.g. Garment was in pristine condition, great communication!"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRatingModalSwap(null)}
                className="flex-1 py-2.5 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={actionLoadingId === ratingModalSwap.id}
                className="flex-1 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
              >
                Mark Complete
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
