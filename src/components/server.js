const TOKEN = '0502dc57267cf21fb61b9b5b6b6f3a82';
const BASE_FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?appid=${TOKEN}&units=metric&lang=ru&`;
const BASE_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${TOKEN}&units=metric&lang=ru&`;
const BASE_GEOCODER_URL = `https://api.openweathermap.org/geo/1.0/direct?appid=${TOKEN}&lang=ru&`;

function groupWeatherDataByDay(data) {
  const grouped = {};

  data.list.forEach(entry => {
    const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  });

  return grouped;
}
function getGroupedWeatherConditions(data) {
  const grouped = groupWeatherDataByDay(data);
  const result = [];

  for (const [date, entries] of Object.entries(grouped)) {
    const maxTemp = Math.max(...entries.map(e => e.main.temp_max));
    const minTemp = Math.min(...entries.map(e => e.main.temp_min));
    const humidity = Math.max(...entries.map(e => e.main.humidity));
    const pressure = Math.max(...entries.map(e => e.main.pressure));
    const weatherStatuses = entries.map(e => `${e.weather[0].description}|${e.weather[0].icon}`);

    const mostCommon = weatherStatuses.sort((a, b) =>
      weatherStatuses.filter(v => v === a).length - weatherStatuses.filter(v => v === b).length
    ).pop();

    const [status, icon] = mostCommon.split('|');

    result.push({
      date,
      max_temp: maxTemp,
      min_temp: minTemp,
      humidity,
      pressure,
      status,
      icon: icon.replace('n', 'd'),
    });
  }

  return result.slice(1);
}
export async function fetchWeatherByCity(city) {
  const geoUrl = `${BASE_GEOCODER_URL}q=${encodeURIComponent(city)}&limit=1`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    throw new Error("Город не найден");
  }

  const { lat, lon } = geoData[0];
  return await fetchWeatherByCoords(lat, lon);
}

export async function fetchWeatherByCoords(lat, lon) {
  const forecastRes = await fetch(`${BASE_FORECAST_URL}lat=${lat}&lon=${lon}`);
  const forecastJson = await forecastRes.json();
  const forecast = getGroupedWeatherConditions(forecastJson);

  const currentRes = await fetch(`${BASE_WEATHER_URL}lat=${lat}&lon=${lon}`);
  const currentJson = await currentRes.json();

  const current = {
    status: currentJson.weather[0].description,
    icon: currentJson.weather[0].icon.replace('n', 'd'),
    temp: currentJson.main.temp,
    feels_like: currentJson.main.feels_like,
    humidity: currentJson.main.humidity,
    pressure: currentJson.main.pressure,
    wind_speed: currentJson.wind.speed,
    wind_deg: currentJson.wind.deg,
  };

  return {
    forecast,
    current,
    lat: currentJson.coord.lat,
    lon: currentJson.coord.lon,
    location: currentJson.name,
  };
}