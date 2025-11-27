import { ApiResponse, HealthResponse, LocationRecord } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getLocations(
  limit = 100,
  offset = 0
): Promise<ApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/location?limit=${limit}&offset=${offset}`,
    {
      cache: 'no-store', // Ensure fresh data
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${response.statusText}`);
  }
  return response.json();
}

export async function getLocationById(id: number): Promise<{
  success: boolean;
  data: LocationRecord;
}> {
  const response = await fetch(`${API_BASE_URL}/api/location/${id}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch location: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteLocation(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/location/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete location: ${response.statusText}`);
  }
  return response.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

