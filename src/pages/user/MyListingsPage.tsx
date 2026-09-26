import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Shirt,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Tag,
} from 'lucide-react';
import { ClothingItem, ItemStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, SkeletonCard, EmptyState } from '../../components/LoadingSpinner';

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchMyItems = async () => {
    try {
      setIsLoading(true);
      const res = await api.getItems({
        ownerId: user?.id,
        status: statusFilter === 'ALL' ? 'ALL' : (statusFilter as ItemStatus),
      });
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load wardrobe items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [user?.id, statusFilter]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      setIsDeleting(true);
      await api.deleteItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Available for Swap
          </span>
        );
      case 'PENDING_SWAP':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            In Swap Process
          </span>
        );
      case 'SWAPPED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Swapped
          </span>
        );
      case 'REMOVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Wardrobe Management</span>
          <h1 className="font-serif text-3xl font-extrabold text-stone-900 mt-1">My Clothes for Swap</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Manage your uploaded listings, edit valuations, and track swap status.
          </p>
        </div>

        <Link
          to="/add-clothes"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-all shadow-sm hover:shadow-md shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>List New Item</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'AVAILABLE', 'PENDING_SWAP', 'SWAPPED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-[#315C3A] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {st === 'ALL'
              ? 'All Items'
              : st === 'AVAILABLE'
              ? 'Available'
              : st === 'PENDING_SWAP'
              ? 'Pending Swap'
              : 'Swapped'}
          </button>
        ))}
      </div>

      {/* Items List / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="No clothes found in this tab"
          description="You haven't listed any items under this status yet. Upload your clean pre-loved clothes to begin swapping!"
          actionText="List an Item"
          actionHref="/add-clothes"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Image Header */}
                <div className="relative aspect-4/5 bg-stone-100 overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">{getStatusBadge(item.status)}</div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-bold text-[#315C3A] uppercase">{item.brand}</span>
                    <span className="bg-stone-100 px-2 py-0.5 rounded-sm font-semibold">
                      Size {item.size}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-stone-500">Swap Valuation:</span>
                    <span className="font-serif font-bold text-stone-900 text-base">
                      ₹{item.estimatedValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-3 border-t border-stone-100 bg-[#F7F4ED]/40 flex items-center justify-between gap-2">
                <Link
                  to={`/item/${item.id}`}
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="View Public Listing"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/edit-clothes/${item.id}`}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#315C3A] hover:border-[#315C3A] transition-colors flex items-center gap-1 text-xs font-semibold shadow-xs"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center gap-1 text-xs font-semibold shadow-xs cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">Remove Clothing Item?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to remove this garment from your swap wardrobe? Active swap proposals for this item will be cancelled.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-full border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Keep Item
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <LoadingSpinner size="sm" className="border-white" /> : <span>Confirm Delete</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
