import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Repeat,
  Sparkles,
  ShieldCheck,
  Leaf,
  Plus,
  MapPin,
  Heart,
  Droplet,
  Trees,
  Scale,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { ClothingItem } from '../../types';
import { api } from '../../services/api';
import { ClothingCard } from '../../components/ClothingCard';
import { SwapModal } from '../../components/SwapModal';
import { SkeletonCard } from '../../components/LoadingSpinner';

export const LandingPage: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<ClothingItem[]>([]);
  const [nearbyItems, setNearbyItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSwapItem, setSelectedSwapItem] = useState<ClothingItem | null>(null);

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        setIsLoading(true);
        const res = await api.getItems({ limit: 8, sort: 'popular' });
        setFeaturedItems(res.items || []);

        const nearbyRes = await api.getItems({ limit: 4, location: 'Bangalore' });
        setNearbyItems(nearbyRes.items || []);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLandingData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION - Editorial Masthead */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-black/8 bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#F4DDD4] border border-[#C66B4F]/30 text-[#C66B4F] text-[10px] font-bold uppercase tracking-[0.2em]">
                <Leaf className="w-3.5 h-3.5 text-[#C66B4F]" />
                <span>Vol. 01 — The Circular Wardrobe Archive</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#1A1A1A] tracking-tight leading-[1.08]">
                Swap More. <br />
                <span className="text-[#C66B4F] italic font-normal">Waste Less.</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
                An editorial platform for mindful clothing exchange. Discover pre-loved archival garments, rotate your personal collection, and keep textiles in active circulation without money.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xs bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#C66B4F] transition-all shadow-none"
                >
                  <span>Explore Garments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/add-clothes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xs bg-white text-[#1A1A1A] border border-black/15 text-xs uppercase tracking-wider font-bold hover:border-[#C66B4F] hover:text-[#C66B4F] transition-all shadow-none"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C66B4F]" />
                  <span>List a Garment</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-black/8 grid grid-cols-3 gap-6 text-xs text-stone-600">
                <div>
                  <strong className="block font-serif text-2xl font-bold text-[#1A1A1A]">100%</strong>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">Equitable Barter</span>
                </div>
                <div>
                  <strong className="block font-serif text-2xl font-bold text-[#1A1A1A]">₹0 Cut</strong>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">Direct Exchange</span>
                </div>
                <div>
                  <strong className="block font-serif text-2xl font-bold text-[#C66B4F]">Zero Waste</strong>
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium">Circular Lifecycle</span>
                </div>
              </div>
            </div>

            {/* Right Hero Editorial Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Image */}
                <div className="relative rounded-xs overflow-hidden border border-black/10 aspect-4/5 bg-[#E2E0D8]">
                  <img
                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=80"
                    alt="Sustainable fashion swap"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Swap Card Badge */}
                  <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xs bg-[#FFFFFF]/95 backdrop-blur-md border border-black/10 shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xs bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center font-serif font-bold text-sm">
                        ⇄
                      </div>
                      <div>
                        <p className="text-xs font-serif font-bold text-stone-900">Vintage Denim ⇄ Linen Knit</p>
                        <p className="text-[10px] tracking-wider uppercase text-stone-500">Bangalore Swap • Verified</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-xs bg-[#F4DDD4] text-[#C66B4F] text-[9px] font-bold uppercase tracking-wider border border-[#C66B4F]/20">
                      -3.2KG CO₂
                    </span>
                  </div>
                </div>

                {/* Decorative floating editorial badge */}
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-xs bg-[#1A1A1A] text-[#F9F7F2] p-1.5 text-center flex flex-col items-center justify-center font-serif font-bold text-xs border border-white/20 shadow-md">
                  <span className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-[#C66B4F]">EST.</span>
                  <span>2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW REWEAR WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Process & Method</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">How ReWear Operates</h2>
          <p className="text-xs text-stone-600">
            A clean barter workflow designed to rotate high-quality garments without financial transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-xs bg-white border border-black/8 shadow-none hover:border-[#C66B4F]/60 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xs bg-[#F9F7F2] text-[#1A1A1A] border border-black/8 font-serif font-bold text-base flex items-center justify-center">
              01
            </div>
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Archive Your Garment</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload photos of clean, wearable clothes. Our algorithm suggests fair exchange estimates based on condition and fabric quality.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xs bg-white border border-black/8 shadow-none hover:border-[#C66B4F]/60 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xs bg-[#F4DDD4] text-[#C66B4F] border border-[#C66B4F]/30 font-serif font-bold text-base flex items-center justify-center">
              02
            </div>
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Discover Pieces</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Browse curated wardrobe collections filtered by brand, category, condition, size, and approximate city location.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xs bg-white border border-black/8 shadow-none hover:border-[#C66B4F]/60 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xs bg-[#F9F7F2] text-[#1A1A1A] border border-black/8 font-serif font-bold text-base flex items-center justify-center">
              03
            </div>
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Propose Exchange</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Select one of your available items to offer in exchange. Compare estimated swap values and add a personalized note.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-xs bg-white border border-black/8 shadow-none hover:border-[#C66B4F]/60 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xs bg-[#1A1A1A] text-white font-serif font-bold text-base flex items-center justify-center">
              04
            </div>
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">Agree & Transfer</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Chat to finalize physical handover or courier. Once exchanged, mark the swap complete to celebrate zero waste impact.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CLOTHING GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-black/8 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Curated Selection</span>
            <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-0.5">Latest Archival Releases</h2>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#C66B4F]"
          >
            <span>View Complete Archive ({featuredItems.length}+)</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C66B4F]" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onRequestSwap={(it) => setSelectedSwapItem(it)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. SUSTAINABLE FASHION IMPACT & DATA */}
      <section className="bg-[#EFECE6] py-16 border-y border-black/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Ecological Imperative</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] leading-tight">
                Why Swapping Outperforms Fast Fashion
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                The global apparel trade produces immense textile runoff and landfill saturation. Extending a garment's active life by just 9 months reduces its combined carbon, waste, and water footprints by ~20–30%.
              </p>
              <div className="pt-2">
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs bg-[#1A1A1A] text-white text-[11px] uppercase tracking-wider font-bold hover:bg-[#C66B4F] transition-colors"
                >
                  <span>Read Value Methodology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-6 rounded-xs bg-white border border-black/8 space-y-3">
                <div className="w-9 h-9 rounded-xs bg-[#F9F7F2] text-[#C66B4F] flex items-center justify-center border border-black/5">
                  <Droplet className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1A1A1A]">~2,700 L</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-800">Water Conserved</p>
                <p className="text-[11px] text-stone-500">Equivalent to clean drinking water for one individual across 2.5 years.</p>
              </div>

              <div className="p-6 rounded-xs bg-white border border-black/8 space-y-3">
                <div className="w-9 h-9 rounded-xs bg-[#F9F7F2] text-[#C66B4F] flex items-center justify-center border border-black/5">
                  <Trees className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1A1A1A]">~2.5 kg</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-800">CO₂ Prevented</p>
                <p className="text-[11px] text-stone-500">Direct reduction in raw textile agriculture and synthetic dyeing.</p>
              </div>

              <div className="p-6 rounded-xs bg-white border border-black/8 space-y-3">
                <div className="w-9 h-9 rounded-xs bg-[#F9F7F2] text-[#C66B4F] flex items-center justify-center border border-black/5">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1A1A1A]">0% Fees</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-800">Pure Exchange</p>
                <p className="text-[11px] text-stone-500">No intermediary fees or artificial price markups on pre-loved pieces.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEARBY SWAPS SECTION */}
      {nearbyItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-black/8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Regional Chapters</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-0.5">Available in Bangalore</h2>
            </div>
            <Link
              to="/browse?location=Bangalore"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#C66B4F]"
            >
              <span>Explore Chapter Wardrobe</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C66B4F]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {nearbyItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onRequestSwap={(it) => setSelectedSwapItem(it)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. TESTIMONIALS & COMMUNITY VOICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Community Voices</span>
          <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Curators & Swappers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xs bg-white border border-black/8 space-y-4">
            <p className="text-xs text-stone-600 font-serif italic leading-relaxed text-base">
              "I had three high-quality linen shirts sitting idle in my wardrobe. Within four days on ReWear, I swapped them for a vintage jacket and handloom kurta. Zero waste, zero money spent."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Priya"
                className="w-8 h-8 rounded-xs object-cover border border-black/10"
              />
              <div>
                <p className="text-xs font-bold text-stone-900">Priya Sharma</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">Bangalore • 6 Swaps</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xs bg-white border border-black/8 space-y-4">
            <p className="text-xs text-stone-600 font-serif italic leading-relaxed text-base">
              "The transparent fair value engine makes exchanges effortless. You see exactly why a piece is valued fairly based on garment provenance and condition."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                alt="Aarav"
                className="w-8 h-8 rounded-xs object-cover border border-black/10"
              />
              <div>
                <p className="text-xs font-bold text-stone-900">Aarav Patel</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">Mumbai • 9 Swaps</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xs bg-white border border-black/8 space-y-4">
            <p className="text-xs text-stone-600 font-serif italic leading-relaxed text-base">
              "Handloom sarees and festive apparel are worn once and tucked away. Swapping festive wear has given my cultural wardrobe limitless fresh variety."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                alt="Ananya"
                className="w-8 h-8 rounded-xs object-cover border border-black/10"
              />
              <div>
                <p className="text-xs font-bold text-stone-900">Ananya Iyer</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500">Delhi • 14 Swaps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xs bg-[#1A1A1A] text-white p-8 sm:p-14 overflow-hidden shadow-xl text-center space-y-6 border border-black/20">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-xs bg-[#C66B4F] text-white text-[10px] font-bold uppercase tracking-[0.2em]">
              Circular Archive Community
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to Give Your Clothes a Second Life?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
              Create an account, list items from your wardrobe, and connect with conscious swappers in your city.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xs bg-[#C66B4F] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#b05a3f] transition-colors"
              >
                Join Archive Free
              </Link>
              <Link
                to="/browse"
                className="px-6 py-3 rounded-xs bg-transparent border border-white/40 text-white text-xs uppercase tracking-wider font-bold hover:bg-white/10 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Swap Modal Container */}
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
