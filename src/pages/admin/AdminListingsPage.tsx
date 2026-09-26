import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Search, Trash2, ArrowLeft, Eye, Tag, AlertCircle } from 'lucide-react';
import { ClothingItem } from '../../types';
import { api } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const AdminListingsPage: React.FC = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminListings(search);
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search]);

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to remove this garment from the platform?')) return;

    try {
      setActionLoadingId(itemId);
      await api.deleteAdminListing(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-stone-900">Garment Catalog Audit</h1>
            <p className="text-xs text-stone-500">Monitor and moderate all clothes listed across the ecosystem</p>
          </div>
        </div>

        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title, brand, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="No clothing items found"
          description="Try modifying your search criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F4ED] border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Swap Valuation</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                        />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{item.title}</p>
                          <p className="text-stone-500 text-[11px]">
                            {item.brand} • Size {item.size} • {item.condition}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-stone-700">
                      <p className="font-semibold">{item.owner?.name || 'Owner'}</p>
                      <p className="text-stone-400 text-[10px]">{item.location}</p>
                    </td>
                    <td className="p-4 text-stone-600">
                      {item.category} / {item.subcategory || 'General'}
                    </td>
                    <td className="p-4 font-serif font-bold text-stone-900">
                      ₹{item.estimatedValue.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'PENDING_SWAP'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/item/${item.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 text-[11px] font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={actionLoadingId === item.id}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-[11px] font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
