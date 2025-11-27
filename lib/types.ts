export interface LocationRecord {
  id: number;
  result_data: {
    age?: number;
    uuid?: string;
    event?: string;
    coords?: {
      floor?: number | null;
      speed?: number;
      heading?: number;
      accuracy?: number;
      altitude?: number;
      latitude?: number;
      longitude?: number;
      speed_accuracy?: number;
      heading_accuracy?: number;
      altitude_accuracy?: number;
      ellipsoidal_altitude?: number;
    };
    extras?: {
      nearbyBLEDevice?: any | null;
      nearbyTeltonika?: {
        id: string | number;
        name: string;
        rssi: number;
      } | null;
      [key: string]: any;
    };
    battery?: {
      level?: number;
      is_charging?: boolean;
    };
    activity?: {
      type?: string;
      confidence?: number;
    };
    odometer?: number;
    is_moving?: boolean;
    timestamp?: string;
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

