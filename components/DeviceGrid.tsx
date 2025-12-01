'use client';

import { DeviceGroup } from '@/lib/types';
import { DeviceCard } from './DeviceCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorMessage } from './ErrorMessage';

interface DeviceGridProps {
    devices: DeviceGroup[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
}

export function DeviceGrid({ devices, loading, error, onRetry }: DeviceGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={onRetry} />;
    }

    if (devices.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cihaz bulunamadı</h3>
                <p className="text-gray-500">Henüz hiç cihaz kaydı bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
                <DeviceCard key={device.deviceId} device={device} />
            ))}
        </div>
    );
}
