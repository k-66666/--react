
import React, { useState, useEffect } from 'react';
import { getWeather, getWeatherDescription, LOCATION_CONFIG } from '../services/weatherService';
import { CloudRain, MapPin } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<{ temp: number, desc: string, icon: string, isRain: boolean } | null>(null);
  
  useEffect(() => {
    const fetchWeather = async () => {
        const data = await getWeather(LOCATION_CONFIG.lat, LOCATION_CONFIG.lon);
        if (data) {
           const info = getWeatherDescription(data.weatherCode);
           setWeather({
             temp: data.temperature,
             desc: info.label,
             icon: info.icon,
             isRain: info.isRainy
           });
        }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000);
    return () => clearInterval(interval);
  }, []);

  if (!weather) return (
     <div className="mx-4 mt-4 mb-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse flex justify-center">
        <span className="text-slate-400 text-xs">加载天气中...</span>
     </div>
  );

  return (
    <div className="mx-4 mt-4 mb-2 bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-50 shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex items-center gap-1.5 bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <MapPin size={10} className="text-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-800">{LOCATION_CONFIG.name}</span>
            </div>
        </div>
        
        <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform">{weather.icon}</span>
                <div>
                    <div className="text-2xl font-black text-slate-800 font-mono leading-none">{weather.temp}°</div>
                    <div className="text-xs text-slate-500 font-bold mt-0.5">{weather.desc}</div>
                </div>
            </div>
            {weather.isRain && (
                <div className="bg-blue-100 p-2 rounded-full animate-pulse">
                <CloudRain size={20} className="text-blue-500" />
                </div>
            )}
        </div>
        
        {/* Rain Alert */}
        {weather.isRain && (
            <div className="mt-3 text-[10px] text-blue-600 font-bold bg-blue-50/80 px-2 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5">
                <span>☔️</span> 下雨啦，记得带伞
            </div>
        )}
    </div>
  );
};
