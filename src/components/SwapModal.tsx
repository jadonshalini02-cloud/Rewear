import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRightLeft, Plus, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { ClothingItem } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface SwapModalProps {
  targetItem: ClothingItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ targetItem, isOpen, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [userItems, setUserItems] = useState<ClothingItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccessMessage(null);

    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchUserItems = async () => {
      try {
        setIsLoading(true);
        const res = await api.getItems({ ownerId: user?.id, status: 'AVAILABLE' });
        const available = res.items || [];
        setUserItems(available);
        if (available.length > 0) {
          setSelectedItemId(available[0].id);
        }
      } catch (err: any) {
        setError('Failed to load your wardrobe items.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserItems();
  }, [isOpen, isAuthenticated, user?.id]);

  if (!isOpen) return null;

  const selectedItem = userItems.find((i) => i.id === selectedItemId);
  const valueDiff = selectedItem ? selectedItem.estimatedValue - targetItem.estimatedValue : 0;
  const isFairValue = selectedItem ? Math.abs(valueDiff) / targetItem.estimatedValue <= 0.35 : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      setError('Please select an item from your wardrobe to offer.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await api.createSwap({
        requestedItemId: targetItem.id,
        offeredItemId: selectedItemId,
        message: message.trim() || undefined,
      });

      setSuccessMessage(res.message || 'Swap request sent successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send swap request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#F7F4ED] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F1E8] text-[#315C3A] flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">Initiate Clothing Swap</h2>
              <p className="text-xs text-stone-500">Zero-waste barter exchange with {targetItem.owner?.name || 'Item Owner'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F1E8] text-[#315C3A] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">Swap Request Submitted!</h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto">{successMessage}</p>
            <p className="text-xs text-stone-400">You can coordinate shipping or local meet-up in your chat messages.</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Login Required</h3>
            <p className="text-sm text-stone-600">Please log in to your ReWear account to send swap requests.</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#315C3A] text-white text-sm font-medium hover:bg-[#25472c] transition-colors"
            >
              Log In to Continue
            </Link>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-3 text-sm text-stone-500 font-medium">Checking your available wardrobe items...</p>
          </div>
        ) : userItems.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E8F1E8] text-[#315C3A] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">Your Wardrobe is Empty</h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              You need at least one available clothing listing to offer in a swap exchange.
            </p>
            <Link
              to="/add-clothes"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#315C3A] text-white text-sm font-medium hover:bg-[#25472c] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>List an Item Now</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Side-by-Side Comparison Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Item (User B) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    Item You Want
                  </span>
                  <div className="flex gap-3 items-center">
                    <img
                      src={targetItem.images[0]}
                      alt={targetItem.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate font-serif">{targetItem.title}</h4>
                      <p className="text-[11px] text-stone-500">{targetItem.brand} • Size {targetItem.size}</p>
                      <p className="text-xs font-semibold text-[#315C3A] mt-1">₹{targetItem.estimatedValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Owner: {targetItem.owner?.name}</span>
                  <span>{targetItem.location.split(',')[0]}</span>
                </div>
              </div>

              {/* User Offered Item (User A) */}
              <div className="p-4 rounded-2xl bg-[#E8F1E8]/40 border border-[#315C3A]/30 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#315C3A] block mb-2">
                    Item You Offer
                  </span>
                  {selectedItem ? (
                    <div className="flex gap-3 items-center">
                      <img
                        src={selectedItem.images[0]}
                        alt={selectedItem.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate font-serif">{selectedItem.title}</h4>
                        <p className="text-[11px] text-stone-500">{selectedItem.brand} • Size {selectedItem.size}</p>
                        <p className="text-xs font-semibold text-[#315C3A] mt-1">₹{selectedItem.estimatedValue.toLocaleString()}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Wardrobe Selector */}
                <div className="mt-3">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Select from your items:</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full bg-white border border-stone-300 text-stone-900 text-xs rounded-lg p-2 focus:ring-2 focus:ring-[#315C3A]"
                  >
                    {userItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title} (₹{it.estimatedValue.toLocaleString()} - {it.size})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Value Differential & Fairness Breakdown */}
            {selectedItem && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D6A756]" />
                  <span className="text-stone-600">
                    Value Difference:{' '}
                    <strong className="text-stone-900">
                      {valueDiff >= 0 ? `+₹${valueDiff.toLocaleString()}` : `-₹${Math.abs(valueDiff).toLocaleString()}`}
                    </strong>
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isFairValue
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isFairValue ? 'Fair Value Match' : 'Value Disparity (Negotiable)'}
                </span>
              </div>
            )}

            {/* Personalized Message Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Message to {targetItem.owner?.name || 'Owner'} (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Hi! I love your item and would love to exchange it with my piece. Let me know if you are interested!"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#315C3A]"
              />
            </div>

            {/* Safety Note */}
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-4 h-4 text-[#315C3A] shrink-0" />
              <span>Items remain available until the owner formally accepts your proposal.</span>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedItemId}
                className="px-6 py-2.5 rounded-full bg-[#315C3A] text-white text-xs font-semibold hover:bg-[#25472c] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="border-white" />
                    <span>Sending Proposal...</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Send Swap Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
