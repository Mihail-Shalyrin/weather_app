import React, { useEffect, useState } from 'react';
import CurrentWeather from './CurrentWeather';
import ForecastList from './ForecastList';
import SearchCity from './SearchCity';
import geo from './pictures/geo.png';
import search from './pictures/search.png'
import MeteoConditions from './MeteoConditions';
function WeatherApp() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);
  const [cityQuery, setCityQuery] = useState(null);
  const [showSearch, setShowSearch] = useState(false); // 👈 для выпадающей формы

  const fetchWeather = async ({ latitude, longitude, city }) => {
    setLoading(true);
    setGeoError(null);
    try {
      let url;
      if (city) {
        url = `http://localhost:5973/api/getCity?сity=${city}`;
      } else {
        url = `http://localhost:5973/api/getWeather?lat=${latitude}&lon=${longitude}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Ошибка при получении данных с сервера");
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error("Ошибка при загрузке погоды:", err);
      setGeoError("Не удалось загрузить данные о погоде.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityQuery) {
      fetchWeather({ city: cityQuery });
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather({ latitude, longitude });
        },
        (error) => {
          console.error("Геолокация недоступна:", error.message);
          setGeoError("Не удалось получить геолокацию.");
          setLoading(false);
        }
      );
    } else {
      console.error("Геолокация не поддерживается");
      setGeoError("Ваш браузер не поддерживает геолокацию.");
      setLoading(false);
    }
  }, [cityQuery]);

  const handleCitySearch = (city) => {
    setCityQuery(city);
    setShowSearch(false); // ⛔ закрыть форму после ввода
  };

  if (loading) return <p>Загрузка...</p>;
  if (geoError) return <p>{geoError}</p>;
  if (!weatherData) return <p>Ошибка загрузки данных</p>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 relative">
      <div className="button-container">

        <button
          onClick={() => setShowSearch((prev) => !prev)}
          className="absolute top-4 right-4 text-2xl"
          title="Поиск города"
        >
          <img src={search} alt="Кнопка" width="32" height="32"/>
          
        </button>

        {/* Выпадающая форма поиска */}
        {showSearch && (
          <div className="mb-4 mt-2">
            <SearchCity onSearch={handleCitySearch} />
          </div>
        )}

        <button
          onClick={() => setCityQuery(null)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
        >
          <img src={geo} alt="Кнопка" width="32" height="32"/>
        </button>
        
      </div>
        
      <CurrentWeather data={weatherData.current} location={weatherData.location} />
      <MeteoConditions data={weatherData.current} />
      <ForecastList forecast={weatherData.forecast} />
    </div>
  );
}

export default WeatherApp;
