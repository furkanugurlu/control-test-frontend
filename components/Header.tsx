'use client';

import { useState } from 'react';
import { ServerStatus } from './ServerStatus';
import { MapPin, Trash2 } from 'lucide-react';
import { deleteAllLocations } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  totalRecords?: number;
}

export function Header({ totalRecords }: HeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (!confirm('Tüm kayıtları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAllLocations();
      alert('Tüm kayıtlar başarıyla silindi.');
      router.refresh();
    } catch (error) {
      alert('Kayıtlar silinirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      console.error('Error deleting all locations:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Location Dashboard</h1>
              <p className="text-sm text-gray-500">Location ve Teltonika Verileri</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {totalRecords !== undefined && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{totalRecords.toLocaleString('tr-TR')}</span> kayıt
              </div>
            )}
            <button
              onClick={handleDeleteAll}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              aria-label="Tüm kayıtları sil"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Siliniyor...' : 'Tümünü Sil'}
            </button>
            <ServerStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
