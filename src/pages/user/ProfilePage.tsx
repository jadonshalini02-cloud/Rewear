import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Mail,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Leaf,
  Trees,
  Droplet,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserStats } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
];

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Kochi', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur'];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState<string>(user?.name || '');
  const [location, setLocation] = useState<string>(user?.location || 'Bangalore, India');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || AVATARS[0]);
  const [stats, setStats] = useState<UserStats | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLocation(user.location);
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || AVATARS[0]);
    }
    api.getUserStats().then((data) => setStats(data)).catch(() => {});
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      await updateProfile({
        name,
        location,
        bio: bio.trim() || undefined,
        avatarUrl,
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const completedSwaps = stats?.completedSwaps || 0;
  const co2Saved = (completedSwaps * 2.5).toFixed(1);
  const waterSaved = completedSwaps * 2700;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="pb-6 border-b border-stone-200/80">
        <span className="text-xs font-bold uppercase tracking-widest text-[#315C3A]">Account Settings</span>
        <h1 className="font-serif text-3xl font-extrabold text-stone-900 mt-1">My Swapper Profile</h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Manage your public wardrobe profile, location, and circular fashion environmental stats.
        </p>
      </div>

      {/* Environmental Impact Summary Badge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#315C3A] text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8F1E8]">
          <Leaf className="w-4 h-4" />
          <span>Your Circular Wardrobe Impact</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1">
            <span className="text-xs text-stone-200 block">Garments Exchanged</span>
            <span className="font-serif text-3xl font-extrabold">{completedSwaps}</span>
            <span className="text-[11px] text-[#E8F1E8] block">Diverted from Landfills</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-stone-200 block">Carbon Footprint Saved</span>
            <span className="font-serif text-3xl font-extrabold">~{co2Saved} kg</span>
            <span className="text-[11px] text-[#E8F1E8] block">CO₂ Emissions Prevented</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-stone-200 block">Water Conserved</span>
            <span className="font-serif text-3xl font-extrabold">{waterSaved.toLocaleString()} L</span>
            <span className="text-[11px] text-[#E8F1E8] block">Agricultural Water Saved</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        {/* Avatar Select */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-3">
            Profile Avatar
          </label>
          <div className="flex items-center gap-3">
            {AVATARS.map((av, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setAvatarUrl(av)}
                className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                  avatarUrl === av ? 'border-[#315C3A] scale-105 ring-2 ring-[#315C3A]/30' : 'border-stone-200 opacity-70'
                }`}
              >
                <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
          />
        </div>

        {/* Email read only */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
            Email Address
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full bg-stone-100 border border-stone-200 rounded-xl p-3 text-xs text-stone-500 cursor-not-allowed"
          />
        </div>

        {/* City Location */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
            City / Location *
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900"
          >
            {CITIES.map((c) => (
              <option key={c} value={`${c}, India`}>
                {c}, India
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
            Wardrobe Bio & Trade Preferences
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Share your personal style aesthetic, favorite fabrics, or what sizes you are interested in swapping for..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-7 py-3 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="border-white" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
