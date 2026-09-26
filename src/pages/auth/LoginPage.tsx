import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Repeat, Mail, Lock, Sparkles, ShieldAlert, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(demoEmail, demoPass);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-xs border border-black/10 shadow-lg">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xs bg-[#1A1A1A] text-[#F9F7F2] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-[#1A1A1A]">
              Re<span className="text-[#C66B4F]">Wear.</span>
            </span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] tracking-tight">
            Account Authentication
          </h2>
          <p className="text-xs text-stone-500">Sign in to access your wardrobe archive and swap negotiations</p>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="p-3.5 rounded-xs bg-[#F9F7F2] border border-black/8 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C66B4F] block">
            Instant 1-Click Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('priya@rewear.org', 'swap1234')}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xs bg-white border border-black/10 text-stone-800 text-[11px] font-bold uppercase tracking-wider hover:border-[#C66B4F] hover:text-[#C66B4F] transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-none"
            >
              <div className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#C66B4F]" />
                <span>Swapper Demo</span>
              </div>
              <span className="text-[9px] text-stone-400 font-normal lowercase tracking-normal">priya@rewear.org</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@rewear.org', 'admin1234')}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xs bg-[#1A1A1A] border border-black/10 text-[#F9F7F2] text-[11px] font-bold uppercase tracking-wider hover:bg-[#C66B4F] transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-none"
            >
              <div className="flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C66B4F]" />
                <span>Admin Portal</span>
              </div>
              <span className="text-[9px] text-stone-300 font-normal lowercase tracking-normal">admin@rewear.org</span>
            </button>
          </div>
        </div>

        {/* Form Error */}
        {error && (
          <div className="p-3.5 rounded-xs bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-600 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#F9F7F2] border border-black/10 rounded-xs pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-[#C66B4F] focus:ring-1 focus:ring-[#C66B4F]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-600 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F9F7F2] border border-black/10 rounded-xs pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-[#C66B4F] focus:ring-1 focus:ring-[#C66B4F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xs bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C66B4F] transition-all flex items-center justify-center gap-2 shadow-none cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" className="border-white" /> : <span>Sign In</span>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-black/8">
          <p className="text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#C66B4F] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
