'use client';

import { ServerStatus } from './ServerStatus';
import { MapPin, Trash2 } from 'lucide-react';

interface HeaderProps {
  totalRecords?: number;
  onDeleteAll?: () => void;
  isDeletingAll?: boolean;
  showDeleteAllConfirm?: boolean;
  onShowDeleteAllConfirm?: (show: boolean) => void;
}

export function Header({ 
  totalRecords, 
  onDeleteAll, 
  isDeletingAll = false,
  showDeleteAllConfirm = false,
  onShowDeleteAllConfirm 
}: HeaderProps) {
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
            {onDeleteAll && totalRecords !== undefined && totalRecords > 0 && (
              <>
                {!showDeleteAllConfirm ? (
                  <button
                    onClick={() => onShowDeleteAllConfirm?.(true)}
                    disabled={isDeletingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    aria-label="Tümünü sil"
                  >
                    <Trash2 className="w-4 h-4" />
                    Tümünü Sil
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-2">
                    <span className="text-xs text-red-700 font-medium">
                      {totalRecords} kayıt silinecek. Emin misiniz?
                    </span>
                    <button
                      onClick={onDeleteAll}
                      disabled={isDeletingAll}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeletingAll ? 'Siliniyor...' : 'Evet, Sil'}
                    </button>
                    <button
                      onClick={() => onShowDeleteAllConfirm?.(false)}
                      disabled={isDeletingAll}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                )}
              </>
            )}
            <ServerStatus />
          </div>
        </div>
      </div>
    </header>
  );
}

