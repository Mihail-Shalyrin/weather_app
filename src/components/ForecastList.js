import ForecastItem from './ForecastItem';
import './styles.css'
function ForecastList({ forecast }) {
  return (
    <div className="my-margin color">
      
     
       <div className='label1'>Прогноз на 5 дней</div>
        {forecast.map((item) => (
          <ForecastItem key={item.date} data={item} />
        ))}
      
    </div>
  );
}

export default ForecastList;
