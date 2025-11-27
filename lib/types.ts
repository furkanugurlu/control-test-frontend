export interface LocationRecord {
  id: number;
  result_data: {
    latitude?: number;
    longitude?: number;
    extras?: {
      nearbyTeltonika?: {
        id: string | number;
        name: string;
        rssi: number;
      } | null;
      [key: string]: any;
    };
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  success: boolean;
  data: LocationRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

