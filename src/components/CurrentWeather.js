import "./styles.css"
function CurrentWeather({ data, location }) {
  return (
   
      <div className="my-margin"  align="center">

                    <h2 className="text-xl font-bold mb-2">{location}</h2>
                    <img
                      src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                      alt={data.status}
                      className="mx-auto mb-2"
                    />
                    <div className="text-2xl font-semibold mb-1">
                      {Math.round(data.temp)} °C
                    </div>
                    <p className="text-gray-600 mb-4">
                      {data.status}, ощущается как {Math.round(data.feels_like)} °C
                    </p>
         
      </div>
      
 
   

   
   
  );
}


export default CurrentWeather;
