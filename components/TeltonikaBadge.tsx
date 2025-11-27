'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { getRSSIColor, getRSSIBgColor } from '@/lib/utils';

interface TeltonikaBadgeProps {
  teltonika: {
    id: string | number;
    name: string;
    rssi: number;
  };
}

export function TeltonikaBadge({ teltonika }: TeltonikaBadgeProps) {
  const rssiColor = getRSSIColor(teltonika.rssi);
  const rssiBgColor = getRSSIBgColor(teltonika.rssi);

  // Calculate signal strength percentage (RSSI ranges from -100 to 0, roughly)
  const signalStrength = Math.max(0, Math.min(100, ((teltonika.rssi + 100) / 100) * 100));

  return (
    <div className={`${rssiBgColor} rounded-lg p-4 mb-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Wifi className={`w-5 h-5 ${rssiColor}`} />
        <h4 className="font-semibold text-gray-900">{teltonika.name}</h4>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm text-gray-600">RSSI:</span>
        <span className={`font-bold text-lg ${rssiColor}`}>
          {teltonika.rssi} dBm
        </span>
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              teltonika.rssi > -70
                ? 'bg-green-500'
                : teltonika.rssi > -85
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${signalStrength}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Device ID: {teltonika.id}
        </div>
      </div>
    </div>
  );
}

