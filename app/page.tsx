'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { LocationGrid } from '@/components/LocationGrid';
import { Pagination } from '@/components/Pagination';
import { getLocations, deleteLocation, deleteAllLocations } from '@/lib/api';
import { LocationRecord } from '@/lib/types';
import { RefreshCw, Trash2, Loader2, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false,
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLocations(limit, offset);
      setRecords(response.data);
      setPagination(response.pagination);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [limit, offset]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page when changing limit
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchLocations();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLocation(id);
      // Remove the deleted record from the list immediately for better UX
      setRecords((prev) => prev.filter((record) => record.id !== id));
      // Update pagination total
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (error) {
      console.error('Error deleting location:', error);
      alert(error instanceof Error ? error.message : 'Kayıt silinirken bir hata oluştu');
      // Refresh on error to sync state
      fetchLocations();
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllLocations();
      setShowDeleteAllConfirm(false);
      // Clear all records
      setRecords([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
      // Refresh to get updated state
      fetchLocations();
    } catch (error) {
      console.error('Error deleting all locations:', error);
      alert(error instanceof Error ? error.message : 'Tüm kayıtlar silinirken bir hata oluştu');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        totalRecords={pagination.total}
        onDeleteAll={handleDeleteAll}
        isDeletingAll={isDeletingAll}
        showDeleteAllConfirm={showDeleteAllConfirm}
        onShowDeleteAllConfirm={setShowDeleteAllConfirm}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="limit" className="text-sm font-medium text-gray-700">
              Sayfa başına kayıt:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              aria-label="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            {pagination.total > 0 && (
              <>
                {!showDeleteAllConfirm ? (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    disabled={loading || isDeletingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    aria-label="Tümünü sil"
                  >
                    <Trash2 className="w-4 h-4" />
                    Tümünü Sil
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="text-xs text-red-700 font-medium">
                      {pagination.total} kayıt silinecek. Emin misiniz?
                    </span>
                    <button
                      onClick={handleDeleteAll}
                      disabled={isDeletingAll}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      {isDeletingAll ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Siliniyor...
                        </>
                      ) : (
                        'Evet, Sil'
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteAllConfirm(false)}
                      disabled={isDeletingAll}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Location Grid */}
        <LocationGrid
          records={records}
          loading={loading}
          error={error}
          onRetry={fetchLocations}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {!loading && !error && records.length > 0 && (
          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            offset={pagination.offset}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
