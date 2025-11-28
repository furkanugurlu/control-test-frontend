'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LocationRecord } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { CoordinateDisplay } from './CoordinateDisplay';
import { TeltonikaBadge } from './TeltonikaBadge';
import { ArrowRight, Trash2, Loader2 } from 'lucide-react';

interface LocationCardProps {
  record: LocationRecord;
  onDelete?: (id: number) => void;
}

export function LocationCard({ record, onDelete }: LocationCardProps) {
  const { result_data, id, created_at, updated_at } = record;
  const teltonika = result_data.extras?.nearbyTeltonika;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(id);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-semibold">
          ID: {id}
        </span>
        <div className="text-right">
          <span className="text-gray-500 text-xs block">
            {formatRelativeTime(created_at)}
          </span>
          {updated_at !== created_at && (
            <span className="text-gray-400 text-xs">
              Güncellendi: {formatRelativeTime(updated_at)}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="mb-4">
        {result_data.coords?.latitude && result_data.coords?.longitude ? (
          <CoordinateDisplay
            latitude={result_data.coords.latitude}
            longitude={result_data.coords.longitude}
          />
        ) : (
          <div className="mb-4 text-gray-400 italic text-sm">
            Koordinat bilgisi yok
          </div>
        )}

        {teltonika ? (
          <TeltonikaBadge teltonika={teltonika} />
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 italic text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <span>No Teltonika device nearby</span>
            </div>
          </div>
        )}

        {/* Additional Info Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {result_data.battery?.level !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
              <span className="text-gray-600">Batarya:</span>
              <span className={`font-semibold ${
                result_data.battery.level > 0.5 ? 'text-green-600' :
                result_data.battery.level > 0.2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(result_data.battery.level * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {result_data.is_moving !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
              <span className={`font-semibold ${
                result_data.is_moving ? 'text-green-600' : 'text-gray-600'
              }`}>
                {result_data.is_moving ? 'Hareketli' : 'Hareketsiz'}
              </span>
            </div>
          )}
          {result_data.coords?.accuracy && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
              <span className="text-gray-600">Doğruluk:</span>
              <span className="font-semibold">{result_data.coords.accuracy.toFixed(1)}m</span>
            </div>
          )}
        </div>

        {/* Hits Section - Show only top 2 strongest signals */}
        {result_data.extras?.hits && result_data.extras.hits.length > 0 && (() => {
          // Sort by RSSI (highest = strongest signal, since RSSI is negative)
          const sortedHits = [...result_data.extras.hits].sort((a, b) => b.rssi - a.rssi);
          const topHits = sortedHits.slice(0, 2);
          
          return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                En Güçlü Sinyaller {result_data.extras.hits.length > 2 && `(${result_data.extras.hits.length} cihazdan ilk 2)`}
              </h4>
              <div className="space-y-2">
                {topHits.map((hit, index) => (
                  <div
                    key={hit.id || index}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {hit.name || 'İsimsiz Cihaz'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {hit.id}
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-700">
                          {hit.rssi} dBm
                        </div>
                        <div className="text-xs text-gray-500">
                          {hit.rssi >= -50 ? 'Güçlü' : hit.rssi >= -70 ? 'Orta' : 'Zayıf'}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        hit.rssi >= -50 ? 'bg-green-500' :
                        hit.rssi >= -70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Extras Section - Collapsible for other extras */}
        {result_data.extras && 
         Object.keys(result_data.extras).filter(
           key => key !== 'nearbyTeltonika' && key !== 'hits'
         ).length > 0 && (
          <details className="mt-2">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              Diğer bilgiler
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(result_data.extras).filter(
                      ([key]) => key !== 'nearbyTeltonika' && key !== 'hits'
                    )
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
          </details>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
        <Link
          href={`/location/${id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors group"
        >
          Detayları Gör
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        {onDelete && (
          <div className="relative">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                aria-label="Kaydı sil"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-2">
                <span className="text-xs text-red-700 font-medium">Emin misiniz?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Evet'
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Hayır
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

