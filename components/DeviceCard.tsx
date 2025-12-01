'use client';

import Link from 'next/link';
import { DeviceGroup } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { Smartphone, MapPin, Clock, ArrowRight } from 'lucide-react';

interface DeviceCardProps {
    device: DeviceGroup;
}

export function DeviceCard({ device }: DeviceCardProps) {
    const { deviceId, recordCount, latestRecord } = device;
    const coords = latestRecord.result_data.coords;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {deviceId === 'unknown' ? 'Bilinmeyen Cihaz' : deviceId}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {recordCount} kayıt
                        </p>
                    </div>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Aktif
                </span>
            </div>

            {/* Latest Location Info */}
            <div className="space-y-3 mb-4">
                {coords?.latitude && coords?.longitude ? (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600">Son Konum</p>
                            <p className="text-xs font-mono text-gray-800 truncate">
                                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-500 italic">Konum bilgisi yok</p>
                    </div>
                )}

                <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Son Güncelleme</p>
                        <p className="text-xs text-gray-800">
                            {formatRelativeTime(latestRecord.created_at)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Info Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Card Footer */}
            <div className="pt-4 border-t border-gray-100">
                <Link
                    href={`/device/${encodeURIComponent(deviceId)}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors group w-full justify-center py-2 hover:bg-blue-50 rounded-md"
                >
                    Tüm Kayıtları Gör
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
