import "./styles.css";
import thermometer from './pictures/thermometer.png';
import humidity from './pictures/humidity.png';
import wind from './pictures/wind.png';

function MeteoConditions({ data }) {
  return (
    <div className="my-margin color">
        
      <div className="label1">Метеоусловия</div>

      <div className="weather-row">
        <img src={thermometer} alt="давление" className="icon" />
        <span className="label">Давление</span>
        <span className="value">{data.pressure} мм рт. ст.</span>
      </div>

      <div className="weather-row">
        <img src={humidity} alt="влажность" className="icon" />
        <span className="label">Влажность</span>
        <span className="value">{data.humidity}%</span>
      </div>

      <div className="weather-row">
        <img src={wind} alt="ветер" className="icon" />
        <span className="label">Скорость ветра</span>
        <span className="value">{data.wind_speed} м/с</span>
      </div>
    </div>
  );
}

export default MeteoConditions;