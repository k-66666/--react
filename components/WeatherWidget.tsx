
import React, { useState, useEffect } from 'react';
import { getWeather, getWeatherDescription, LOCATION_CONFIG } from '../services/weatherService';
import { MapPin, Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Moon } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number, desc: string, code: number, isRain: boolean, isDay: boolean } | null>(null);
  
  useEffect(() => {
    const fetchWeather = async () => {
        const data = await getWeather(LOCATION_CONFIG.lat, LOCATION_CONFIG.lon);
        if (data) {
           const info = getWeatherDescription(data.weatherCode);
           setWeather({
             temp: data.temperature,
             desc: info.label,
             code: data.weatherCode,
             isRain: info.isRainy,
             isDay: !!data.isDay
           });
        }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get the correct colorful icon
  const getWeatherIcon = (code: number, isDay: boolean) => {
      // WMO codes
      if (code === 0) return isDay ? <Sun className="text-amber-500 fill-amber-100" size={32} /> : <Moon className="text-indigo-400 fill-indigo-100" size={32} />;
      if (code >= 1 && code <= 3) return <CloudSun className="text-orange-400" size={32} />;
      if (code >= 45 && code <= 48) return <CloudFog className="text-slate-400" size={32} />;
      if (code >= 51 && code <= 67) return <CloudRain className="text-blue-500 fill-blue-50" size={32} />;
      if (code >= 71 && code <= 77) return <Snowflake className="text-cyan-400" size={32} />;
      if (code >= 80 && code <= 82) return <CloudRain className="text-blue-600" size={32} />;
      if (code >= 95) return <CloudLightning className="text-purple-500" size={32} />;
      return <Cloud className="text-slate-400" size={32} />;
  };

  if (!weather) return (
     <div className="mx-4 mt-4 mb-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse flex justify-center">
        <span className="text-slate-400 text-xs">加载天气中...</span>
     </div>
  );

  return (
    <div className="mx-4 mt-4 mb-2 bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-50 shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/50">
                <MapPin size={10} className="text-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-800">{LOCATION_CONFIG.name}</span>
            </div>
        </div>
        
        <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
                <span className="filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                    {getWeatherIcon(weather.code, weather.isDay)}
                </span>
                <div>
                    <div className="text-2xl font-black text-slate-800 font-mono leading-none tracking-tight">{weather.temp}°</div>
                    <div className="text-xs text-slate-500 font-bold mt-1 ml-0.5">{weather.desc}</div>
                </div>
            </div>
            {weather.isRain && (
                <div className="bg-blue-100 p-2 rounded-full animate-pulse shadow-inner">
                   <CloudRain size={20} className="text-blue-500" />
                </div>
            )}
        </div>
        
        {/* Rain Alert */}
        {weather.isRain && (
            <div className="mt-3 text-[10px] text-blue-600 font-bold bg-blue-50/80 px-2 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5 animate-pulse">
                <span>☔️</span> 下雨啦，记得带伞
            </div>
        )}
    </div>
  );
};
