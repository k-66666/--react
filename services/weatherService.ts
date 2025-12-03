
interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: number;
}

// Luodian, Guizhou Coordinates
export const LOCATION_CONFIG = {
  name: '贵州罗甸',
  lat: 25.42,
  lon: 106.75
};

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`
    );
    const data = await response.json();
    return {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day
    };
  } catch (e) {
    console.error("Failed to fetch weather", e);
    return null;
  }
};

export const getWeatherDescription = (code: number): { label: string, icon: string, isRainy: boolean } => {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  if (code === 0) return { label: '晴朗', icon: '☀️', isRainy: false };
  if (code >= 1 && code <= 3) return { label: '多云', icon: '⛅', isRainy: false };
  if (code >= 45 && code <= 48) return { label: '雾', icon: '🌫️', isRainy: false };
  if (code >= 51 && code <= 55) return { label: '毛毛雨', icon: '🌧️', isRainy: true };
  if (code >= 61 && code <= 67) return { label: '下雨', icon: '☔', isRainy: true };
  if (code >= 71 && code <= 77) return { label: '下雪', icon: '❄️', isRainy: true };
  if (code >= 80 && code <= 82) return { label: '阵雨', icon: '🌦️', isRainy: true };
  if (code >= 95) return { label: '雷雨', icon: '⚡', isRainy: true };
  
  return { label: '阴', icon: '☁️', isRainy: false };
};
