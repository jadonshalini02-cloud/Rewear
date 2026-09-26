import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Heart, Sparkles, ShieldCheck, Leaf, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] text-stone-300 pt-16 pb-12 border-t border-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xs bg-[#C66B4F] text-white flex items-center justify-center">
                <Repeat className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-white">
                Re<span className="text-[#C66B4F]">Wear.</span>
              </span>
            </Link>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              An editorial archive for circular fashion and non-monetary garment exchange. Swap what you no longer wear, curate timeless pieces, and eliminate textile waste.
            </p>
            <div className="flex items-center gap-4 pt-2 text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5 text-stone-200">
                <Leaf className="w-3.5 h-3.5 text-[#C66B4F]" />
                <span className="uppercase tracking-wider text-[10px] font-semibold">Zero-Waste Barter</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-stone-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C66B4F]" />
                <span className="uppercase tracking-wider text-[10px] font-semibold">Community Verified</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Archive Index</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  All Garments
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Exchange Philosophy
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Women" className="hover:text-white transition-colors">
                  Womenswear
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Men" className="hover:text-white transition-colors">
                  Menswear
                </Link>
              </li>
              <li>
                <Link to="/browse?category=Unisex" className="hover:text-white transition-colors">
                  Unisex & Vintage
                </Link>
              </li>
            </ul>
          </div>

          {/* Hubs */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Regional Chapters</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/browse?location=Bangalore" className="hover:text-white transition-colors">
                  Bangalore
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Mumbai" className="hover:text-white transition-colors">
                  Mumbai
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Delhi" className="hover:text-white transition-colors">
                  Delhi NCR
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Pune" className="hover:text-white transition-colors">
                  Pune
                </Link>
              </li>
              <li>
                <Link to="/browse?location=Hyderabad" className="hover:text-white transition-colors">
                  Hyderabad
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethics & Legal */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F]">Manifesto</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Fair Value Algorithm
                </Link>
              </li>
              <li>
                <span className="text-stone-500">Fabric Preservation Care</span>
              </li>
              <li>
                <span className="text-stone-500">Zero Landfill Commitment</span>
              </li>
              <li>
                <span className="text-stone-500">Terms & Archival Rights</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits with Editorial Number */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span className="font-serif text-3xl font-light text-stone-700 select-none">01</span>
            <p className="text-[11px] tracking-wider uppercase">© {new Date().getFullYear()} ReWear Archival Publishing</p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>Designed for circular reuse &</span>
            <span className="text-[#C66B4F] font-semibold uppercase tracking-wider">Fast-Fashion Waste Reduction</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
