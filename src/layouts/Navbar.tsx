import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Repeat,
  Plus,
  Heart,
  MessageSquare,
  ArrowRightLeft,
  LayoutDashboard,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { SwapValueCalculatorModal } from '../components/SwapValueCalculatorModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F9F7F2]/95 backdrop-blur-md border-b border-black/8 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xs bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center group-hover:bg-[#C66B4F] transition-colors duration-200">
                  <Repeat className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-2xl tracking-tight text-[#1A1A1A] leading-none">
                    Re<span className="text-[#C66B4F]">Wear.</span>
                  </span>
                  <span className="text-[9px] tracking-[0.25em] uppercase font-semibold text-stone-500 mt-0.5">
                    Sustainable Swap / Vol 01
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-6 ml-4">
                <Link
                  to="/browse"
                  className={`text-xs uppercase tracking-[0.14em] font-semibold transition-colors ${
                    isActive('/browse')
                      ? 'text-[#1A1A1A] border-b-2 border-[#C66B4F] pb-1'
                      : 'text-stone-600 hover:text-[#C66B4F] pb-1'
                  }`}
                >
                  Browse Archive
                </Link>
                <Link
                  to="/how-it-works"
                  className={`text-xs uppercase tracking-[0.14em] font-semibold transition-colors ${
                    isActive('/how-it-works')
                      ? 'text-[#1A1A1A] border-b-2 border-[#C66B4F] pb-1'
                      : 'text-stone-600 hover:text-[#C66B4F] pb-1'
                  }`}
                >
                  Philosophy & Guide
                </Link>
                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="text-xs uppercase tracking-[0.14em] font-semibold text-stone-600 hover:text-[#C66B4F] transition-colors flex items-center gap-1.5 cursor-pointer pb-1"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#C66B4F]" />
                  <span>Fair Value Engine</span>
                </button>
              </nav>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Saved Favorites */}
                  <Link
                    to="/favorites"
                    className="p-2 rounded-xs text-stone-600 hover:text-[#C66B4F] hover:bg-stone-200/50 transition-colors"
                    title="Saved Favorites"
                  >
                    <Heart className="w-4 h-4" />
                  </Link>

                  {/* Swap Requests */}
                  <Link
                    to="/swap-requests"
                    className="p-2 rounded-xs text-stone-600 hover:text-[#C66B4F] hover:bg-stone-200/50 transition-colors relative"
                    title="Swap Requests"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </Link>

                  {/* Messages / Chat */}
                  <Link
                    to="/chat"
                    className="p-2 rounded-xs text-stone-600 hover:text-[#1A1A1A] hover:bg-stone-200/50 transition-colors"
                    title="Negotiation Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>

                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* Add Clothes CTA */}
                  <Link
                    to="/add-clothes"
                    className="ml-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xs bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#C66B4F] transition-colors shadow-none"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C66B4F]" />
                    <span>Submit Garment</span>
                  </Link>

                  {/* User Profile Menu */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-0.5 rounded-xs hover:ring-1 hover:ring-[#C66B4F] transition-all cursor-pointer"
                    >
                      <img
                        src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={user?.name}
                        className="w-8 h-8 rounded-xs object-cover border border-black/10"
                      />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xs shadow-xl border border-black/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2.5 border-b border-stone-100">
                          <p className="text-xs uppercase tracking-wider font-bold text-stone-900 truncate">{user?.name}</p>
                          <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="mt-1 inline-block px-1.5 py-0.5 rounded-xs bg-[#1A1A1A] text-stone-200 text-[9px] font-bold tracking-widest uppercase">
                              EDITORIAL ADMIN
                            </span>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#F9F7F2] hover:text-[#C66B4F]"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-[#C66B4F]" />
                            <span>My Dashboard</span>
                          </Link>
                          <Link
                            to="/my-listings"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#F9F7F2] hover:text-[#C66B4F]"
                          >
                            <Repeat className="w-3.5 h-3.5 text-[#C66B4F]" />
                            <span>Wardrobe Archive</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#F9F7F2] hover:text-[#C66B4F]"
                          >
                            <UserIcon className="w-3.5 h-3.5 text-[#C66B4F]" />
                            <span>Profile & Identity</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#C66B4F] hover:bg-stone-50"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Admin Control</span>
                            </Link>
                          )}
                        </div>

                        <div className="pt-1 border-t border-stone-100">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-xs uppercase tracking-wider font-bold text-stone-700 hover:text-[#C66B4F] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xs bg-[#C66B4F] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#b05a3f] transition-all shadow-none"
                  >
                    Join ReWear
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 md:hidden">
              {isAuthenticated && <NotificationDropdown />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xs text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-black/8 bg-[#F9F7F2] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/browse"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-stone-800 hover:bg-stone-200/50"
              >
                Browse Archive
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-xs uppercase tracking-wider font-semibold text-stone-800 hover:bg-stone-200/50"
              >
                Philosophy & Guide
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCalculatorOpen(true);
                }}
                className="w-full text-left px-3 py-2 text-xs uppercase tracking-wider font-semibold text-stone-800 hover:bg-stone-200/50 flex items-center gap-2"
              >
                <Calculator className="w-3.5 h-3.5 text-[#C66B4F]" />
                <span>Fair Value Engine</span>
              </button>
            </nav>

            {isAuthenticated ? (
              <div className="pt-3 border-t border-black/8 space-y-2">
                <Link
                  to="/add-clothes"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xs bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-bold"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C66B4F]" />
                  <span>Submit Garment</span>
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xs bg-white border border-black/8 text-xs font-medium text-stone-800 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#C66B4F]" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/swap-requests"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xs bg-white border border-black/8 text-xs font-medium text-stone-800 flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#C66B4F]" />
                    <span>Swaps</span>
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xs bg-white border border-black/8 text-xs font-medium text-stone-800 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-700" />
                    <span>Messages</span>
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2.5 rounded-xs bg-white border border-black/8 text-xs font-medium text-stone-800 flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#C66B4F]" />
                    <span>Saved</span>
                  </Link>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xs bg-[#1A1A1A] text-[#F9F7F2] text-xs font-bold uppercase tracking-wider"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#C66B4F]" />
                    <span>Admin Control Center</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-stone-500 hover:text-rose-700 rounded-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-black/8 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xs border border-black/10 bg-white text-stone-800 text-xs uppercase tracking-wider font-bold"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xs bg-[#C66B4F] text-white text-xs uppercase tracking-wider font-bold"
                >
                  Join ReWear
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Fair Value Calculator Modal */}
      <SwapValueCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </>
  );
};
