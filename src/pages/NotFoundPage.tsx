import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-[#E8F1E8] text-[#315C3A] flex items-center justify-center mb-6">
        <Shirt className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-4xl font-extrabold text-stone-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-stone-600 max-w-md mb-8">
        The garment or page you were looking for seems to have found a new home or doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#315C3A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#25472c] transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Marketplace</span>
      </Link>
    </div>
  );
};
