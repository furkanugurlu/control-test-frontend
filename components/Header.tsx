'use client';

import { ServerStatus } from './ServerStatus';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  totalRecords?: number;
}

export function Header({ totalRecords }: HeaderProps) {

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
            <ServerStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
