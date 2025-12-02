'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Pagination } from '@/components/Pagination';
import { getLocations, deleteAllLocations } from '@/lib/api';
import { LocationRecord, DeviceGroup } from '@/lib/types';
import { groupByDeviceId } from '@/lib/utils';
import { RefreshCw, MapPin, Battery, Activity, Clock, Eye, Trash2 } from 'lucide-react';

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
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteAll = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteAllLocations();
      // Verileri yeniden çek
      await fetchLocations();
      setShowDeleteConfirm(false);
      setSelectedDevice('all'); // Reset device selection
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler silinirken bir hata oluştu');
      console.error('Error deleting locations:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Filter records based on selected device
  const filteredRecords = selectedDevice === 'all' 
    ? records 
    : records.filter(record => record.result_data.device_id === selectedDevice);

  // Get unique device IDs for dropdown
  const uniqueDevices = Array.from(new Set(records.map(r => r.result_data.device_id || 'unknown')));

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
            <p className="text-sm text-gray-600">Seçili Cihaz Kayıtları</p>
            <p className="text-2xl font-bold text-gray-900">{filteredRecords.length}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                disabled={loading || deleting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                aria-label="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Yenile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading || deleting || records.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                aria-label="Tümünü Sil"
              >
                <Trash2 className="w-4 h-4" />
                Tümünü Sil
              </button>
            </div>
          </div>

          {/* Device Filter Dropdown */}
          <div className="flex items-center gap-4">
            <label htmlFor="deviceFilter" className="text-sm font-medium text-gray-700">
              Cihaz Seçin:
            </label>
            <select
              id="deviceFilter"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              disabled={loading}
              className="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
            >
              <option value="all">Tüm Cihazlar ({records.length} kayıt)</option>
              {uniqueDevices.map((deviceId) => {
                const deviceRecordCount = records.filter(r => (r.result_data.device_id || 'unknown') === deviceId).length;
                return (
                  <option key={deviceId} value={deviceId}>
                    {deviceId === 'unknown' ? 'Bilinmeyen Cihaz' : deviceId} ({deviceRecordCount} kayıt)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {records.length === 0 ? 'Henüz Kayıt Yok' : 'Kayıt Bulunamadı'}
            </h3>
            <p className="text-gray-500 mb-4">
              {records.length === 0 
                ? 'Veritabanında henüz hiç konum kaydı bulunmuyor.' 
                : 'Seçilen cihaz için kayıt bulunamadı.'}
            </p>
            {records.length === 0 && (
              <p className="text-sm text-gray-400">
                Yeni kayıtlar eklendiğinde burada görünecektir.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cihaz ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Konum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batarya
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hareket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hız
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer group"
                      onClick={() => window.location.href = `/location/${record.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          #{record.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.result_data.device_id || 'Bilinmeyen'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.result_data.coords?.latitude && record.result_data.coords?.longitude ? (
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="font-mono text-xs">
                              {record.result_data.coords.latitude.toFixed(6)}, {record.result_data.coords.longitude.toFixed(6)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.result_data.battery?.level !== undefined ? (
                          <div className="flex items-center gap-1">
                            <Battery className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm font-semibold ${
                              record.result_data.battery.level > 0.5 ? 'text-green-600' :
                              record.result_data.battery.level > 0.2 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {(record.result_data.battery.level * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.result_data.is_moving !== undefined ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            record.result_data.is_moving 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <Activity className="w-3 h-3" />
                            {record.result_data.is_moving ? 'Hareketli' : 'Durgun'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.result_data.coords?.speed !== undefined 
                          ? `${(record.result_data.coords.speed * 3.6).toFixed(1)} km/h`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {new Date(record.created_at).toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/location/${record.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors group-hover:bg-blue-200"
                        >
                          <Eye className="w-3 h-3" />
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && records.length > 0 && (
          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            offset={pagination.offset}
            onPageChange={handlePageChange}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tüm Verileri Sil</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                <strong className="text-red-600">{pagination.total} adet</strong> kayıt kalıcı olarak silinecek. 
                Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Evet, Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
