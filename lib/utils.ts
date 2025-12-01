export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Az önce';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ay önce`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error('Failed to copy:', err);
  });
}

export function getRSSIColor(rssi: number): string {
  if (rssi > -70) return 'text-green-600';
  if (rssi > -85) return 'text-yellow-600';
  return 'text-red-600';
}

export function getRSSIBgColor(rssi: number): string {
  if (rssi > -70) return 'bg-green-100';
  if (rssi > -85) return 'bg-yellow-100';
  return 'bg-red-100';
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

export function groupByDeviceId(records: import('./types').LocationRecord[]): import('./types').DeviceGroup[] {
  const grouped = new Map<string, import('./types').LocationRecord[]>();

  // Group records by device_id
  records.forEach(record => {
    const deviceId = record.result_data.device_id || 'unknown';
    if (!grouped.has(deviceId)) {
      grouped.set(deviceId, []);
    }
    grouped.get(deviceId)!.push(record);
  });

  // Convert to DeviceGroup array and sort by latest record
  return Array.from(grouped.entries()).map(([deviceId, deviceRecords]) => {
    // Sort records by created_at descending (newest first)
    const sortedRecords = deviceRecords.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      deviceId,
      recordCount: deviceRecords.length,
      latestRecord: sortedRecords[0],
      records: sortedRecords,
    };
  }).sort((a, b) =>
    new Date(b.latestRecord.created_at).getTime() - new Date(a.latestRecord.created_at).getTime()
  );
}
