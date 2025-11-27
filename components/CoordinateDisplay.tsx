'use client';

import { MapPin, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';

interface CoordinateDisplayProps {
  latitude: number;
  longitude: number;
}

export function CoordinateDisplay({ latitude, longitude }: CoordinateDisplayProps) {
  const [copied, setCopied] = useState(false);
  const coordinates = `${latitude}, ${longitude}`;

  const handleCopy = () => {
    copyToClipboard(coordinates);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="font-semibold text-lg text-gray-900">{coordinates}</p>
        <button
          onClick={handleCopy}
          className="ml-auto p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Koordinatları kopyala"
          aria-label="Koordinatları kopyala"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Latitude: {latitude.toFixed(6)} | Longitude: {longitude.toFixed(6)}
      </div>
    </div>
  );
}

