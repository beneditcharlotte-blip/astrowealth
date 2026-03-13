/**
 * 全球主要城市经纬度数据库
 * 用于出生地点选择
 */

export interface City {
  name: string;
  nameCn: string;
  country: string;
  countryCn: string;
  latitude: number;
  longitude: number;
  timezone: number; // UTC offset in hours
}

export const CITIES: City[] = [
  // 中国主要城市
  { name: 'Beijing', nameCn: '北京', country: 'China', countryCn: '中国', latitude: 39.9042, longitude: 116.4074, timezone: 8 },
  { name: 'Shanghai', nameCn: '上海', country: 'China', countryCn: '中国', latitude: 31.2304, longitude: 121.4737, timezone: 8 },
  { name: 'Guangzhou', nameCn: '广州', country: 'China', countryCn: '中国', latitude: 23.1291, longitude: 113.2644, timezone: 8 },
  { name: 'Shenzhen', nameCn: '深圳', country: 'China', countryCn: '中国', latitude: 22.5431, longitude: 114.0579, timezone: 8 },
  { name: 'Chengdu', nameCn: '成都', country: 'China', countryCn: '中国', latitude: 30.5728, longitude: 104.0668, timezone: 8 },
  { name: 'Hangzhou', nameCn: '杭州', country: 'China', countryCn: '中国', latitude: 30.2741, longitude: 120.1551, timezone: 8 },
  { name: 'Wuhan', nameCn: '武汉', country: 'China', countryCn: '中国', latitude: 30.5928, longitude: 114.3055, timezone: 8 },
  { name: 'Nanjing', nameCn: '南京', country: 'China', countryCn: '中国', latitude: 32.0603, longitude: 118.7969, timezone: 8 },
  { name: 'Chongqing', nameCn: '重庆', country: 'China', countryCn: '中国', latitude: 29.4316, longitude: 106.9123, timezone: 8 },
  { name: 'Tianjin', nameCn: '天津', country: 'China', countryCn: '中国', latitude: 39.3434, longitude: 117.3616, timezone: 8 },
  { name: 'Xian', nameCn: '西安', country: 'China', countryCn: '中国', latitude: 34.3416, longitude: 108.9398, timezone: 8 },
  { name: 'Suzhou', nameCn: '苏州', country: 'China', countryCn: '中国', latitude: 31.2990, longitude: 120.5853, timezone: 8 },
  { name: 'Zhengzhou', nameCn: '郑州', country: 'China', countryCn: '中国', latitude: 34.7466, longitude: 113.6253, timezone: 8 },
  { name: 'Changsha', nameCn: '长沙', country: 'China', countryCn: '中国', latitude: 28.2282, longitude: 112.9388, timezone: 8 },
  { name: 'Dalian', nameCn: '大连', country: 'China', countryCn: '中国', latitude: 38.9140, longitude: 121.6147, timezone: 8 },
  { name: 'Qingdao', nameCn: '青岛', country: 'China', countryCn: '中国', latitude: 36.0671, longitude: 120.3826, timezone: 8 },
  { name: 'Kunming', nameCn: '昆明', country: 'China', countryCn: '中国', latitude: 25.0389, longitude: 102.7183, timezone: 8 },
  { name: 'Xiamen', nameCn: '厦门', country: 'China', countryCn: '中国', latitude: 24.4798, longitude: 118.0894, timezone: 8 },
  { name: 'Fuzhou', nameCn: '福州', country: 'China', countryCn: '中国', latitude: 26.0745, longitude: 119.2965, timezone: 8 },
  { name: 'Harbin', nameCn: '哈尔滨', country: 'China', countryCn: '中国', latitude: 45.8038, longitude: 126.5350, timezone: 8 },
  { name: 'Shenyang', nameCn: '沈阳', country: 'China', countryCn: '中国', latitude: 41.8057, longitude: 123.4315, timezone: 8 },
  { name: 'Jinan', nameCn: '济南', country: 'China', countryCn: '中国', latitude: 36.6512, longitude: 117.1201, timezone: 8 },
  { name: 'Nanning', nameCn: '南宁', country: 'China', countryCn: '中国', latitude: 22.8170, longitude: 108.3665, timezone: 8 },
  { name: 'Hefei', nameCn: '合肥', country: 'China', countryCn: '中国', latitude: 31.8206, longitude: 117.2272, timezone: 8 },
  { name: 'Guiyang', nameCn: '贵阳', country: 'China', countryCn: '中国', latitude: 26.6470, longitude: 106.6302, timezone: 8 },
  { name: 'Lhasa', nameCn: '拉萨', country: 'China', countryCn: '中国', latitude: 29.6500, longitude: 91.1000, timezone: 8 },
  { name: 'Urumqi', nameCn: '乌鲁木齐', country: 'China', countryCn: '中国', latitude: 43.8256, longitude: 87.6168, timezone: 8 },
  // 港澳台
  { name: 'Hong Kong', nameCn: '香港', country: 'China', countryCn: '中国', latitude: 22.3193, longitude: 114.1694, timezone: 8 },
  { name: 'Macau', nameCn: '澳门', country: 'China', countryCn: '中国', latitude: 22.1987, longitude: 113.5439, timezone: 8 },
  { name: 'Taipei', nameCn: '台北', country: 'China', countryCn: '中国', latitude: 25.0330, longitude: 121.5654, timezone: 8 },
  // 亚洲其他
  { name: 'Tokyo', nameCn: '东京', country: 'Japan', countryCn: '日本', latitude: 35.6762, longitude: 139.6503, timezone: 9 },
  { name: 'Seoul', nameCn: '首尔', country: 'South Korea', countryCn: '韩国', latitude: 37.5665, longitude: 126.9780, timezone: 9 },
  { name: 'Singapore', nameCn: '新加坡', country: 'Singapore', countryCn: '新加坡', latitude: 1.3521, longitude: 103.8198, timezone: 8 },
  { name: 'Bangkok', nameCn: '曼谷', country: 'Thailand', countryCn: '泰国', latitude: 13.7563, longitude: 100.5018, timezone: 7 },
  { name: 'Mumbai', nameCn: '孟买', country: 'India', countryCn: '印度', latitude: 19.0760, longitude: 72.8777, timezone: 5.5 },
  { name: 'New Delhi', nameCn: '新德里', country: 'India', countryCn: '印度', latitude: 28.6139, longitude: 77.2090, timezone: 5.5 },
  { name: 'Jakarta', nameCn: '雅加达', country: 'Indonesia', countryCn: '印尼', latitude: -6.2088, longitude: 106.8456, timezone: 7 },
  { name: 'Kuala Lumpur', nameCn: '吉隆坡', country: 'Malaysia', countryCn: '马来西亚', latitude: 3.1390, longitude: 101.6869, timezone: 8 },
  { name: 'Dubai', nameCn: '迪拜', country: 'UAE', countryCn: '阿联酋', latitude: 25.2048, longitude: 55.2708, timezone: 4 },
  // 欧洲
  { name: 'London', nameCn: '伦敦', country: 'UK', countryCn: '英国', latitude: 51.5074, longitude: -0.1278, timezone: 0 },
  { name: 'Paris', nameCn: '巴黎', country: 'France', countryCn: '法国', latitude: 48.8566, longitude: 2.3522, timezone: 1 },
  { name: 'Berlin', nameCn: '柏林', country: 'Germany', countryCn: '德国', latitude: 52.5200, longitude: 13.4050, timezone: 1 },
  { name: 'Moscow', nameCn: '莫斯科', country: 'Russia', countryCn: '俄罗斯', latitude: 55.7558, longitude: 37.6173, timezone: 3 },
  { name: 'Rome', nameCn: '罗马', country: 'Italy', countryCn: '意大利', latitude: 41.9028, longitude: 12.4964, timezone: 1 },
  { name: 'Madrid', nameCn: '马德里', country: 'Spain', countryCn: '西班牙', latitude: 40.4168, longitude: -3.7038, timezone: 1 },
  // 北美
  { name: 'New York', nameCn: '纽约', country: 'USA', countryCn: '美国', latitude: 40.7128, longitude: -74.0060, timezone: -5 },
  { name: 'Los Angeles', nameCn: '洛杉矶', country: 'USA', countryCn: '美国', latitude: 34.0522, longitude: -118.2437, timezone: -8 },
  { name: 'San Francisco', nameCn: '旧金山', country: 'USA', countryCn: '美国', latitude: 37.7749, longitude: -122.4194, timezone: -8 },
  { name: 'Chicago', nameCn: '芝加哥', country: 'USA', countryCn: '美国', latitude: 41.8781, longitude: -87.6298, timezone: -6 },
  { name: 'Toronto', nameCn: '多伦多', country: 'Canada', countryCn: '加拿大', latitude: 43.6532, longitude: -79.3832, timezone: -5 },
  { name: 'Vancouver', nameCn: '温哥华', country: 'Canada', countryCn: '加拿大', latitude: 49.2827, longitude: -123.1207, timezone: -8 },
  // 大洋洲
  { name: 'Sydney', nameCn: '悉尼', country: 'Australia', countryCn: '澳大利亚', latitude: -33.8688, longitude: 151.2093, timezone: 10 },
  { name: 'Melbourne', nameCn: '墨尔本', country: 'Australia', countryCn: '澳大利亚', latitude: -37.8136, longitude: 144.9631, timezone: 10 },
];

/**
 * 搜索城市（支持中文和英文）
 */
export function searchCities(query: string): City[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return CITIES.filter(city =>
    city.nameCn.includes(q) ||
    city.name.toLowerCase().includes(q) ||
    city.countryCn.includes(q) ||
    city.country.toLowerCase().includes(q)
  ).slice(0, 10);
}
