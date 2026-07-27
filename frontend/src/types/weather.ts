export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Temperature {
  current: number;
  feels_like: number;
  min: number;
  max: number;
}

export interface Wind {
  speed: number;
  direction?: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon?: string;
}

export interface CurrentWeatherResponse {
  city: string;
  country?: string;
  coordinates: Coordinates;
  temperature: Temperature;
  humidity: number;
  pressure?: number;
  wind: Wind;
  conditions: WeatherCondition[];
  visibility?: number;
  timestamp: string;
  cached?: boolean;
}

export interface ForecastEntry {
  timestamp: string;
  temperature: Temperature;
  humidity: number;
  conditions: WeatherCondition[];
  wind: Wind;
  pop?: number;
}

export interface ForecastResponse {
  city: string;
  country?: string;
  coordinates: Coordinates;
  entries: ForecastEntry[];
}

export interface TrendPoint {
  date: string;
  temperature: number;
  humidity: number;
}

export interface TrendResponse {
  city: string;
  unit: string;
  period: string;
  trends: TrendPoint[];
  summary: {
    avg_temperature: number;
    min_temperature: number;
    max_temperature: number;
    avg_humidity: number;
    dominant_condition: string;
    data_points: number;
  };
}

export interface CityComparison {
  city: string;
  temperature: Temperature;
  humidity: number;
  wind: Wind;
  conditions: WeatherCondition[];
}

export interface CompareResponse {
  cities: CityComparison[];
  compared_at: string;
}

export interface Favorite {
  id: number;
  city: string;
  created_at: string;
}

export interface FavoriteListResponse {
  favorites: Favorite[];
  count: number;
}

export interface FavoriteCreate {
  city: string;
}
