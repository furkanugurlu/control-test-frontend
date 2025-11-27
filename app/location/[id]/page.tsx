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
            {result_data.latitude && result_data.longitude ? (
              <CoordinateDisplay
                latitude={result_data.latitude}
                longitude={result_data.longitude}
              />
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

