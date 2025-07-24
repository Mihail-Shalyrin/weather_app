import ForecastItem from './ForecastItem';
import './styles.css'
function ForecastList({ forecast }) {
  return (
    <div className="my-margin">
      <h3 c>Прогноз на 5 дней</h3>
      <div className="space-y-2">
        {forecast.map((item) => (
          <ForecastItem key={item.date} data={item} />
        ))}
      </div>
    </div>
  );
}

export default ForecastList;
