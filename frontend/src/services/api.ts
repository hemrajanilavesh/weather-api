import axios from 'axios';
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  TrendResponse,
  CompareResponse,
  FavoriteListResponse,
  Favorite,
  FavoriteCreate,
} from '../types/weather';

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

export async function fetchCurrentWeather(city: string, units = 'metric'): Promise<CurrentWeatherResponse> {
  const { data } = await http.get<CurrentWeatherResponse>(`/weather/current/${encodeURIComponent(city)}`, {
    params: { units },
  });
  return data;
}

export async function fetchForecast(city: string, units = 'metric'): Promise<ForecastResponse> {
  const { data } = await http.get<ForecastResponse>(`/weather/forecast/${encodeURIComponent(city)}`, {
    params: { units },
  });
  return data;
}

export async function fetchTrends(city: string, units = 'metric'): Promise<TrendResponse> {
  const { data } = await http.get<TrendResponse>('/weather/analysis/trends', {
    params: { city, units },
  });
  return data;
}

export async function fetchComparison(cities: string[], units = 'metric'): Promise<CompareResponse> {
  const { data } = await http.post<CompareResponse>('/weather/compare', { cities, units });
  return data;
}

export async function fetchFavorites(): Promise<FavoriteListResponse> {
  const { data } = await http.get<FavoriteListResponse>('/favorites');
  return data;
}

export async function addFavorite(city: string): Promise<Favorite> {
  const { data } = await http.post<Favorite>('/favorites', { city } as FavoriteCreate);
  return data;
}

export async function removeFavorite(id: number): Promise<void> {
  await http.delete(`/favorites/${id}`);
}
