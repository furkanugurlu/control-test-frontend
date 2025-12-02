'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LocationGrid } from '@/components/LocationGrid';
import { getLocations, deleteLocation } from '@/lib/api';
import { LocationRecord } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, RefreshCw, Smartphone, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DeviceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const deviceId = decodeURIComponent(params.deviceId as string);

    const [allRecords, setAllRecords] = useState<LocationRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<LocationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchDeviceRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all records
            const response = await getLocations();
            setAllRecords(response.data);

            // Filter records for this device
            const deviceRecords = response.data.filter(
                (record) => (record.result_data.device_id || 'unknown') === deviceId
            );

            // Sort by created_at descending (newest first)
            deviceRecords.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setFilteredRecords(deviceRecords);
            setLastUpdate(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir hata oluştu');
            console.error('Error fetching device records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeviceRecords();
    }, [deviceId]);

    const handleRefresh = () => {
        fetchDeviceRecords();
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteLocation(id);
            // Remove the deleted record from the list immediately for better UX
            setFilteredRecords((prev) => prev.filter((record) => record.id !== id));
            setAllRecords((prev) => prev.filter((record) => record.id !== id));
        } catch (error) {
            console.error('Error deleting location:', error);
            alert(error instanceof Error ? error.message : 'Kayıt silinirken bir hata oluştu');
            // Refresh on error to sync state
            fetchDeviceRecords();
        }
    };

    const latestRecord = filteredRecords[0];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm font-medium">Geri</span>
                            </Link>
                            <div className="h-8 w-px bg-gray-300" />
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Smartphone className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {deviceId === 'unknown' ? 'Bilinmeyen Cihaz' : deviceId}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {filteredRecords.length} kayıt
                                    </p>
                                </div>
                            </div>
                        </div>
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
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Device Stats */}
                {!loading && latestRecord && (
                    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600 mb-1">Son Konum</p>
                                    {latestRecord.result_data.coords?.latitude && latestRecord.result_data.coords?.longitude ? (
                                        <p className="text-sm font-mono text-gray-900 truncate">
                                            {latestRecord.result_data.coords.latitude.toFixed(6)}, {latestRecord.result_data.coords.longitude.toFixed(6)}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Konum bilgisi yok</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-start gap-2">
                                <Clock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-1">Son Güncelleme</p>
                                    <p className="text-sm text-gray-900">
                                        {formatRelativeTime(latestRecord.created_at)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(latestRecord.created_at).toLocaleString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <p className="text-sm text-gray-600 mb-1">Durum</p>
                            <div className="flex flex-wrap gap-2">
                                {latestRecord.result_data.battery?.level !== undefined && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                        <span className="text-gray-600">Batarya:</span>
                                        <span className={`font-semibold ${latestRecord.result_data.battery.level > 0.5 ? 'text-green-600' :
                                            latestRecord.result_data.battery.level > 0.2 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {(latestRecord.result_data.battery.level * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                                {latestRecord.result_data.is_moving !== undefined && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                        <span className={`font-semibold ${latestRecord.result_data.is_moving ? 'text-green-600' : 'text-gray-600'
                                            }`}>
                                            {latestRecord.result_data.is_moving ? 'Hareketli' : 'Hareketsiz'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Update Info */}
                {lastUpdate && (
                    <div className="mb-4 text-right">
                        <span className="text-xs text-gray-500">
                            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                        </span>
                    </div>
                )}

                {/* Records Grid */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Tüm Kayıtlar ({filteredRecords.length})
                        </h2>
                    </div>
                    <LocationGrid
                        records={filteredRecords}
                        loading={loading}
                        error={error}
                        onRetry={fetchDeviceRecords}
                        onDelete={handleDelete}
                    />
                </div>
            </main>
        </div>
    );
}
