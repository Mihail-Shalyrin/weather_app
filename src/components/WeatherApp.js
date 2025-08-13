import React, { useEffect, useState } from 'react';
import CurrentWeather from './CurrentWeather';
import ForecastList from './ForecastList';
import SearchCity from './SearchCity';
import geo from './pictures/geo.png';
import search from './pictures/search.png'
import MeteoConditions from './MeteoConditions';
import { fetchWeatherByCity, fetchWeatherByCoords } from './server'; // путь подставь свой
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
    let data;
    if (city) {
      data = await fetchWeatherByCity(city);
    } else {
      data = await fetchWeatherByCoords(latitude, longitude);
    }
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
        //  Используем координаты по умолчанию
        fetchWeather({ latitude: 55.7558, longitude: 37.6173 });
      }
    );
  } else {
    console.error("Геолокация не поддерживается");
    //  Используем координаты по умолчанию, если даже нет geolocation API
    fetchWeather({ latitude: 55.7558, longitude: 37.6173 });
  }
}, [cityQuery]);

  const handleCitySearch = (city) => {
    setCityQuery(city);
    setShowSearch(false); //  закрыть форму после ввода
  };

  if (loading) return <p>Загрузка...</p>;
  if (geoError) return <p>{geoError}</p>;
  if (!weatherData) return <p>Ошибка загрузки данных assdasdasdasdasds</p>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 relative">
      <div className="button-container">

        <button
          onClick={() => setShowSearch((prev) => !prev)}
          className="circle-button"
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
          className="circle-button" 
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
