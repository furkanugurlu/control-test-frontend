'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { LocationGrid } from '@/components/LocationGrid';
import { Pagination } from '@/components/Pagination';
import { getLocations, deleteLocation } from '@/lib/api';
import { LocationRecord } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLocations();
    }, 30000);

    return () => clearInterval(interval);
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
      // Refresh to get updated data
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert(error instanceof Error ? error.message : 'Kayıt silinirken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totalRecords={pagination.total} />

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
