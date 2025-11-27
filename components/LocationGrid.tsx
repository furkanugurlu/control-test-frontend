'use client';

import { LocationRecord } from '@/lib/types';
import { LocationCard } from './LocationCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorMessage } from './ErrorMessage';

interface LocationGridProps {
  records: LocationRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onDelete?: (id: number) => void;
}

export function LocationGrid({ records, loading, error, onRetry, onDelete }: LocationGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Henüz kayıt yok</p>
        <p className="text-gray-400 text-sm mt-2">
          Veriler yüklendiğinde burada görünecek
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {records.map((record) => (
        <LocationCard key={record.id} record={record} onDelete={onDelete} />
      ))}
    </div>
  );
}

