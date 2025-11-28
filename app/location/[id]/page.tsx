'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { getLocationById } from '@/lib/api';
import { LocationRecord } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { CoordinateDisplay } from '@/components/CoordinateDisplay';
import { TeltonikaBadge } from '@/components/TeltonikaBadge';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [record, setRecord] = useState<LocationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Geçersiz ID');
      setLoading(false);
      return;
    }

    const fetchLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getLocationById(id);
        setRecord(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kayıt yüklenirken bir hata oluştu');
        console.error('Error fetching location:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  const handleRetry = () => {
    if (!isNaN(id)) {
      const fetchLocation = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getLocationById(id);
          setRecord(response.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Kayıt yüklenirken bir hata oluştu');
        } finally {
          setLoading(false);
        }
      };
      fetchLocation();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
          <ErrorMessage message={error || 'Kayıt bulunamadı'} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  const { result_data, created_at, updated_at } = record;
  const teltonika = result_data.extras?.nearbyTeltonika;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        {/* Detail Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Location Kaydı #{record.id}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Oluşturulma: {formatDate(created_at)}</span>
                </div>
                {updated_at !== created_at && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Güncelleme: {formatDate(updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm font-semibold">
              ID: {record.id}
            </div>
          </div>

          {/* Location Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Konum Bilgileri
            </h2>
            {result_data.coords?.latitude && result_data.coords?.longitude ? (
              <div>
                <CoordinateDisplay
                  latitude={result_data.coords.latitude}
                  longitude={result_data.coords.longitude}
                />
                {result_data.coords.accuracy && (
                  <div className="mt-2 text-sm text-gray-600">
                    Doğruluk: {result_data.coords.accuracy.toFixed(2)}m
                  </div>
                )}
                {result_data.coords.altitude !== undefined && (
                  <div className="mt-1 text-sm text-gray-600">
                    Yükseklik: {result_data.coords.altitude.toFixed(2)}m
                  </div>
                )}
                {result_data.coords.speed !== undefined && result_data.coords.speed >= 0 && (
                  <div className="mt-1 text-sm text-gray-600">
                    Hız: {result_data.coords.speed.toFixed(2)} m/s
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 italic">Koordinat bilgisi yok</div>
            )}
          </section>

          {/* Teltonika Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Teltonika Cihaz Bilgisi</h2>
            {teltonika ? (
              <TeltonikaBadge teltonika={teltonika} />
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 italic text-gray-500 text-center">
                No Teltonika device nearby
              </div>
            )}
          </section>

          {/* Hits Section - Show all hits */}
          {result_data.extras?.hits && result_data.extras.hits.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Yakındaki Tüm Cihazlar ({result_data.extras.hits.length})
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  {[...result_data.extras.hits]
                    .sort((a, b) => b.rssi - a.rssi) // Sort by RSSI (highest = strongest)
                    .map((hit, index) => (
                      <div
                        key={hit.id || index}
                        className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {hit.name || 'İsimsiz Cihaz'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate mt-1">
                            {hit.id}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-700">
                              {hit.rssi} dBm
                            </div>
                            <div className="text-xs text-gray-500">
                              {hit.rssi >= -50 ? 'Güçlü' : hit.rssi >= -70 ? 'Orta' : 'Zayıf'}
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${
                            hit.rssi >= -50 ? 'bg-green-500' :
                            hit.rssi >= -70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {/* Additional Information */}
          {(result_data.battery || result_data.activity || result_data.odometer !== undefined || result_data.is_moving !== undefined || result_data.event) && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ek Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result_data.battery && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Batarya</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seviye:</span>
                        <span className="font-medium">
                          {result_data.battery.level !== undefined
                            ? `${(result_data.battery.level * 100).toFixed(0)}%`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Şarj Durumu:</span>
                        <span className="font-medium">
                          {result_data.battery.is_charging ? 'Şarj Oluyor' : 'Şarj Olmuyor'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {result_data.activity && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Aktivite</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tip:</span>
                        <span className="font-medium capitalize">{result_data.activity.type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Güven:</span>
                        <span className="font-medium">
                          {result_data.activity.confidence !== undefined
                            ? `${result_data.activity.confidence}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {result_data.odometer !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Odometer</h3>
                    <div className="text-sm">
                      <span className="text-gray-600">Mesafe: </span>
                      <span className="font-medium">{result_data.odometer.toFixed(2)} km</span>
                    </div>
                  </div>
                )}

                {result_data.is_moving !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Hareket Durumu</h3>
                    <div className="text-sm">
                      <span className={`font-medium ${result_data.is_moving ? 'text-green-600' : 'text-gray-600'}`}>
                        {result_data.is_moving ? 'Hareket Ediyor' : 'Hareketsiz'}
                      </span>
                    </div>
                  </div>
                )}

                {result_data.event && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Olay</h3>
                    <div className="text-sm">
                      <span className="font-medium capitalize">{result_data.event}</span>
                    </div>
                  </div>
                )}

                {result_data.timestamp && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Zaman Damgası</h3>
                    <div className="text-sm text-gray-600">
                      {new Date(result_data.timestamp).toLocaleString('tr-TR')}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Raw Data */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ham Veri (JSON)</h2>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                {JSON.stringify(record, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

