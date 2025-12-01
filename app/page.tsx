'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { DeviceGrid } from '@/components/DeviceGrid';
import { Pagination } from '@/components/Pagination';
import { getLocations } from '@/lib/api';
import { LocationRecord, DeviceGroup } from '@/lib/types';
import { groupByDeviceId } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [devices, setDevices] = useState<DeviceGroup[]>([]);
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

      // Group records by deviceId
      const groupedDevices = groupByDeviceId(response.data);
      setDevices(groupedDevices);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totalRecords={pagination.total} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Toplam Cihaz</p>
            <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Toplam Kayıt</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Ortalama Kayıt/Cihaz</p>
            <p className="text-2xl font-bold text-gray-900">
              {devices.length > 0 ? Math.round(pagination.total / devices.length) : 0}
            </p>
          </div>
        </div>

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

        {/* Device Grid */}
        <DeviceGrid
          devices={devices}
          loading={loading}
          error={error}
          onRetry={fetchLocations}
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
