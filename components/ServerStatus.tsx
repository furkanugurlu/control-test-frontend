'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getHealth } from '@/lib/api';

export function ServerStatus() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await getHealth();
        setStatus('online');
        setLastCheck(new Date());
      } catch (error) {
        setStatus('offline');
        setLastCheck(new Date());
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {status === 'loading' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Kontrol ediliyor...</span>
        </>
      )}
      {status === 'online' && (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">Çevrimiçi</span>
        </>
      )}
      {status === 'offline' && (
        <>
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600 font-medium">Çevrimdışı</span>
        </>
      )}
    </div>
  );
}

