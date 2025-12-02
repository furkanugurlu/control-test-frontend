'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  Battery, 
  Activity, 
  Gauge, 
  Compass,
  Mountain,
  Target,
  Zap,
  Clock,
  Smartphone
} from 'lucide-react';
import { getLocationById } from '@/lib/api';
import { LocationRecord } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-white rounded-lg mb-6 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Ana Sayfaya Dön</span>
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-xl p-6 md:p-8 mb-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-6 h-6" />
                <span className="text-blue-100 text-sm font-medium">
                  {result_data.device_id || 'Bilinmeyen Cihaz'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Kayıt Detayları
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatRelativeTime(created_at)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <div className="text-xs text-blue-100 mb-1">Kayıt ID</div>
              <div className="text-2xl font-bold">#{record.id}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Location Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Konum Bilgileri</h2>
            </div>
            {result_data.coords?.latitude && result_data.coords?.longitude ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="text-sm text-gray-600 mb-2">Koordinatlar</div>
                  <div className="font-mono text-lg font-bold text-gray-900">
                    {result_data.coords.latitude.toFixed(6)}, {result_data.coords.longitude.toFixed(6)}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${result_data.coords.latitude},${result_data.coords.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Google Maps'te Aç
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {result_data.coords.accuracy !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Doğruluk</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {result_data.coords.accuracy.toFixed(1)} m
                      </div>
                    </div>
                  )}

                  {result_data.coords.altitude !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Mountain className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Yükseklik</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {result_data.coords.altitude.toFixed(1)} m
                      </div>
                    </div>
                  )}

                  {result_data.coords.speed !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Hız</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {(result_data.coords.speed * 3.6).toFixed(1)} km/h
                      </div>
                    </div>
                  )}

                  {result_data.coords.heading !== undefined && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Compass className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium">Yön</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {result_data.coords.heading.toFixed(0)}°
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 italic">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Konum bilgisi mevcut değil</p>
              </div>
            )}
          </div>

          {/* Status Cards */}
          <div className="space-y-6">
            {/* Battery Card */}
            {result_data.battery?.level !== undefined && (
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${
                    result_data.battery.level > 0.5 ? 'bg-green-100' :
                    result_data.battery.level > 0.2 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Battery className={`w-5 h-5 ${
                      result_data.battery.level > 0.5 ? 'text-green-600' :
                      result_data.battery.level > 0.2 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <h3 className="font-bold text-gray-900">Batarya</h3>
                </div>
                <div className="mb-3">
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-bold ${
                      result_data.battery.level > 0.5 ? 'text-green-600' :
                      result_data.battery.level > 0.2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(result_data.battery.level * 100).toFixed(0)}
                    </span>
                    <span className="text-xl text-gray-500 mb-1">%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      result_data.battery.level > 0.5 ? 'bg-green-600' :
                      result_data.battery.level > 0.2 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${result_data.battery.level * 100}%` }}
                  />
                </div>
                {result_data.battery.is_charging !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className={`w-4 h-4 ${result_data.battery.is_charging ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-gray-600">
                      {result_data.battery.is_charging ? 'Şarj oluyor' : 'Şarj olmuyor'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Activity/Movement Card */}
            {(result_data.is_moving !== undefined || result_data.activity) && (
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${
                    result_data.is_moving ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Activity className={`w-5 h-5 ${
                      result_data.is_moving ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="font-bold text-gray-900">Hareket</h3>
                </div>
                <div className="space-y-3">
                  {result_data.is_moving !== undefined && (
                    <div>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        result_data.is_moving 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {result_data.is_moving ? 'Hareketli' : 'Durgun'}
                      </span>
                    </div>
                  )}
                  {result_data.activity && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Aktivite Tipi</div>
                      <div className="text-sm font-semibold text-gray-900 capitalize">
                        {result_data.activity.type || 'Bilinmiyor'}
                      </div>
                      {result_data.activity.confidence !== undefined && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Güven: {result_data.activity.confidence}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${result_data.activity.confidence}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Odometer Card */}
            {result_data.odometer !== undefined && (
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gauge className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Kilometre</h3>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-purple-600">
                    {result_data.odometer.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-500 mb-1">km</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Devices Section */}
        {result_data.extras?.hits && result_data.extras.hits.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Yakındaki Cihazlar
              </h2>
              <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                {result_data.extras.hits.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...result_data.extras.hits]
                .sort((a, b) => b.rssi - a.rssi)
                .map((hit, index) => (
                  <div
                    key={hit.id || index}
                    className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {hit.name || 'İsimsiz Cihaz'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate mt-1">
                          {hit.id}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ml-2 shrink-0 ${
                        hit.rssi >= -50 ? 'bg-green-500 animate-pulse' :
                        hit.rssi >= -70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {hit.rssi} dBm
                        </div>
                        <div className="text-xs text-gray-500">
                          {hit.rssi >= -50 ? 'Güçlü Sinyal' : hit.rssi >= -70 ? 'Orta Sinyal' : 'Zayıf Sinyal'}
                        </div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            hit.rssi >= -50 ? 'bg-green-500' :
                            hit.rssi >= -70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, (hit.rssi + 100)))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        {(result_data.event || result_data.timestamp) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ek Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result_data.event && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="text-xs text-amber-700 font-medium mb-1">Olay Türü</div>
                  <div className="text-lg font-bold text-amber-900 capitalize">{result_data.event}</div>
                </div>
              )}
              {result_data.timestamp && (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-700 font-medium mb-1">Zaman Damgası</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {new Date(result_data.timestamp).toLocaleString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Data */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Ham Veri (JSON)
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(record, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

