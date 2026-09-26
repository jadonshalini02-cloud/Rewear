import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-[#315C3A] border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs animate-pulse">
      <div className="aspect-4/5 bg-stone-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-stone-100 rounded-sm w-3/4" />
        <div className="flex justify-between items-center">
          <div className="h-3 bg-stone-100 rounded-sm w-1/3" />
          <div className="h-3 bg-stone-100 rounded-sm w-1/4" />
        </div>
        <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
          <div className="h-4 bg-stone-100 rounded-sm w-1/2" />
          <div className="h-6 w-6 rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-[#F7F4ED]/60 border border-[#E8F1E8] ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8F1E8] flex items-center justify-center text-[#315C3A] shadow-xs mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-serif font-bold text-stone-900 tracking-tight">{title}</h3>
      <p className="mt-2 text-stone-600 max-w-md text-sm leading-relaxed">{description}</p>
      
      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#315C3A] text-white text-sm font-medium hover:bg-[#25472c] transition-colors shadow-xs"
            >
              {actionText}
            </Link>
          ) : actionText && onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#315C3A] text-white text-sm font-medium hover:bg-[#25472c] transition-colors shadow-xs cursor-pointer"
            >
              {actionText}
            </button>
          ) : null}

          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-stone-700 border border-stone-300 text-sm font-medium hover:bg-stone-50 transition-colors shadow-xs cursor-pointer"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
