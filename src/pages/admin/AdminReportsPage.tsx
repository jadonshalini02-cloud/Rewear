import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Eye, User, Shirt } from 'lucide-react';
import { Report } from '../../types';
import { api } from '../../services/api';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminReports(statusFilter !== 'ALL' ? statusFilter : undefined);
      setReports(res.reports || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      setActionLoadingId(reportId);
      await api.resolveReport(reportId, {
        status,
        resolutionNotes: `Marked ${status.toLowerCase()} by admin audit.`,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to update report:', err);
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
            <h1 className="font-serif text-3xl font-extrabold text-stone-900">Safety & Moderation Reports</h1>
            <p className="text-xs text-stone-500">Review flagged clothing items and community behavior issues</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2">
          {['PENDING', 'RESOLVED', 'DISMISSED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                statusFilter === st
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports found"
          description="All community safety reports in this filter have been addressed."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {rep.reason}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Reported by {rep.reporter?.name || 'Community Member'} •{' '}
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : rep.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {rep.status}
                </span>
              </div>

              {rep.description && (
                <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100 italic">
                  "{rep.description}"
                </p>
              )}

              {/* Target Entity */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex items-center gap-4">
                  {rep.reportedItemId && (
                    <span className="flex items-center gap-1 font-semibold text-stone-900">
                      <Shirt className="w-3.5 h-3.5 text-[#315C3A]" />
                      <span>Item ID: {rep.reportedItemId}</span>
                    </span>
                  )}
                  {rep.reportedUserId && (
                    <span className="flex items-center gap-1 font-semibold text-stone-900">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>User ID: {rep.reportedUserId}</span>
                    </span>
                  )}
                </div>

                {rep.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(rep.id, 'DISMISSED')}
                      disabled={actionLoadingId === rep.id}
                      className="px-3.5 py-1.5 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleResolve(rep.id, 'RESOLVED')}
                      disabled={actionLoadingId === rep.id}
                      className="px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
