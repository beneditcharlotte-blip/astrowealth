/**
 * 出生信息输入页
 * Art Deco风格表单，城市搜索，日期时间选择
 */
import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { searchCities, City } from '@/lib/cities';

const ASTROLABE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663430583073/6TWY7FQUZHTo3qi5RWpAMj/astrolabe-detail-3qkZLg4PrLgHoNNd3hYtVK.webp';

export default function InputPage() {
  const [, navigate] = useLocation();

  const [year, setYear] = useState('1990');
  const [month, setMonth] = useState('1');
  const [day, setDay] = useState('1');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('0');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityList, setShowCityList] = useState(false);
  const [error, setError] = useState('');

  const cityResults = useMemo(() => searchCities(cityQuery), [cityQuery]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityQuery(`${city.nameCn}（${city.name}）`);
    setShowCityList(false);
  };

  const handleSubmit = () => {
    if (!selectedCity) {
      setError('请选择出生城市');
      return;
    }
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    if (isNaN(y) || y < 1900 || y > 2030) { setError('请输入有效的出生年份（1900-2030）'); return; }
    if (isNaN(m) || m < 1 || m > 12) { setError('请输入有效的月份'); return; }
    if (isNaN(d) || d < 1 || d > 31) { setError('请输入有效的日期'); return; }
    if (isNaN(h) || h < 0 || h > 23) { setError('请输入有效的小时（0-23）'); return; }
    if (isNaN(min) || min < 0 || min > 59) { setError('请输入有效的分钟（0-59）'); return; }

    setError('');

    // 将数据存入 sessionStorage
    const birthData = {
      year: y, month: m, day: d, hour: h, minute: min,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezone: selectedCity.timezone,
      city: selectedCity.nameCn
    };
    sessionStorage.setItem('birthData', JSON.stringify(birthData));
    navigate('/analyzing');
  };

  // 生成年份选项
  const years = Array.from({ length: 131 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-[#1c1f26] text-[#e0d5c1] flex">
      {/* Left: Decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1f26] via-transparent to-[#1c1f26]" />
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.2 }}
          src={ASTROLABE}
          alt=""
          className="w-[80%] h-auto object-contain"
        />
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#8a8070] hover:text-[#b8963e] transition-colors mb-8 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            返回首页
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#b8963e]/40" />
              <span className="text-[#b8963e] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                Birth Information
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#e8dcc8] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              输入出生信息
            </h1>
            <p className="text-[#8a8070] text-sm">
              精确的出生时间和地点是星盘计算的基础，请尽可能准确填写。
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Date Row */}
            <div>
              <label className="block text-sm text-[#b8963e] mb-2 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                出生日期
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="bg-[#252830] border border-[#b8963e]/20 text-[#e0d5c1] px-3 py-2.5 text-sm focus:border-[#b8963e]/50 focus:outline-none transition-colors appearance-none"
                >
                  {years.map(y => <option key={y} value={y}>{y}年</option>)}
                </select>
                <select
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="bg-[#252830] border border-[#b8963e]/20 text-[#e0d5c1] px-3 py-2.5 text-sm focus:border-[#b8963e]/50 focus:outline-none transition-colors appearance-none"
                >
                  {months.map(m => <option key={m} value={m}>{m}月</option>)}
                </select>
                <select
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className="bg-[#252830] border border-[#b8963e]/20 text-[#e0d5c1] px-3 py-2.5 text-sm focus:border-[#b8963e]/50 focus:outline-none transition-colors appearance-none"
                >
                  {days.map(d => <option key={d} value={d}>{d}日</option>)}
                </select>
              </div>
            </div>

            {/* Time Row */}
            <div>
              <label className="block text-sm text-[#b8963e] mb-2 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                出生时间
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={hour}
                  onChange={e => setHour(e.target.value)}
                  className="bg-[#252830] border border-[#b8963e]/20 text-[#e0d5c1] px-3 py-2.5 text-sm focus:border-[#b8963e]/50 focus:outline-none transition-colors appearance-none"
                >
                  {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}时</option>)}
                </select>
                <select
                  value={minute}
                  onChange={e => setMinute(e.target.value)}
                  className="bg-[#252830] border border-[#b8963e]/20 text-[#e0d5c1] px-3 py-2.5 text-sm focus:border-[#b8963e]/50 focus:outline-none transition-colors appearance-none"
                >
                  {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}分</option>)}
                </select>
              </div>
            </div>

            {/* City Search */}
            <div className="relative">
              <label className="block text-sm text-[#b8963e] mb-2 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                出生城市
              </label>
              <input
                type="text"
                value={cityQuery}
                onChange={e => {
                  setCityQuery(e.target.value);
                  setSelectedCity(null);
                  setShowCityList(true);
                }}
                onFocus={() => setShowCityList(true)}
                placeholder="输入城市名称搜索..."
                className="w-full bg-[#252830] border border-[#b8963e]/20 text-[#e0d5c1] px-4 py-2.5 text-sm focus:border-[#b8963e]/50 focus:outline-none transition-colors placeholder:text-[#6b6358]"
              />
              {/* City dropdown */}
              {showCityList && cityResults.length > 0 && !selectedCity && (
                <div className="absolute z-20 w-full mt-1 bg-[#252830] border border-[#b8963e]/20 max-h-48 overflow-y-auto">
                  {cityResults.map((city, i) => (
                    <button
                      key={`${city.name}-${i}`}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#b8963e]/10 transition-colors border-b border-[#b8963e]/5 last:border-0"
                    >
                      <span className="text-[#e0d5c1]">{city.nameCn}</span>
                      <span className="text-[#8a8070] ml-2 text-xs">{city.name}, {city.countryCn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-[#c47830] text-sm border border-[#c47830]/20 bg-[#c47830]/5 px-4 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full relative py-3.5 border border-[#b8963e]/60 bg-[#b8963e]/10 text-[#e8dcc8] tracking-wider text-base transition-all duration-300 hover:bg-[#b8963e]/20 hover:border-[#b8963e] mt-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              开始星盘分析
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#b8963e]" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#b8963e]" />
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#b8963e]" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#b8963e]" />
            </button>

            <p className="text-[#6b6358] text-xs text-center mt-4">
              出生时间越精确，星盘分析结果越准确。如不确定出生时间，建议选择正午12:00。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
