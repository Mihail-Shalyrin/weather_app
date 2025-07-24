import "./styles.css"
function ForecastItem({ data }) {
  const date = new Date(data.date).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });

  return (
<div >
      <div className="weather-row">
         <img
        src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
        alt={data.status}
        className="icon"
      />
      <span className="label">{date}</span>

        <span className="label">
          {`${Math.round(data.min_temp)}° / ${Math.round(data.max_temp)}°`}
        </span>      
</div>
    </div>
    
  );
}

export default ForecastItem;


// <div className="flex justify-between items-center p-2 bg-blue-100 rounded">
//       <div className="capitalize">{date}</div>
//       <img
//         src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
//         alt={data.status}
//         className="h-10 w-10"
//       />
//       <div className="font-bold">
//         {Math.round(data.min_temp)}° / {Math.round(data.max_temp)}°
//       </div>
//     </div>