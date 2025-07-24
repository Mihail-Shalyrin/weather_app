# Импортируем необходимые модули и библиотеки
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from aiohttp import ClientSession
from datetime import datetime
from collections import defaultdict, Counter
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI

from aiohttp import ClientSession
# Создаем экземпляр приложения FastAPI с корневым путем '/api'
session: ClientSession = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global session
    session = ClientSession()
    yield
    await session.close()

app = FastAPI(root_path='/api', lifespan=lifespan)

# Настраиваем CORS, разрешая делать запросы к нашему API из любых источников, используя любые методы и заголовки
app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)
# Задаем константы для работы с API OpenWeatherMap
TOKEN = '0502dc57267cf21fb61b9b5b6b6f3a82'  # Наш API ключ
# Объявляем эндпоинты, по которым мы будем запрашивать данные у OpenWeatherMap
# https://api.openweathermap.org/data/3.0/onecall?lang=ru&lat={lat}&lon={lon}&exclude={part}&appid={API key}
BASE_FORECAST_URL = f'https://api.openweathermap.org/data/2.5/forecast?appid={TOKEN}&units=metric&lang=ru&'
BASE_WEATHER_URL = f'https://api.openweathermap.org/data/2.5/weather?appid={TOKEN}&units=metric&lang=ru&'#получаем погоду  без города
BASE_GEOCODER_URL = f'http://api.openweathermap.org/geo/1.0/direct?appid={TOKEN}&lang=ru&'# получаем погоду в городе



# Функция для группировки данных о погоде по дням
def group_weather_data_by_day(data):
   grouped_data = defaultdict(list)# Словарь, где ключ — дата, значение — список погодных данных
   for entry in data['list']:
       date = datetime.utcfromtimestamp(entry['dt']).strftime('%Y-%m-%d')
       grouped_data[date].append(entry)# Добавляем запись в соответствующий день
   return dict(grouped_data)
# Функция для получения сгруппированных погодных условий
def get_grouped_weather_conditions(data):
   grouped_data = group_weather_data_by_day(data)
   data = []
   for date, entries in grouped_data.items():
       max_temp = max(entry['main']['temp_max'] for entry in entries) # Максимальная температура за день
       min_temp = min(entry['main']['temp_min'] for entry in entries)# Минимальнеая температура за день
       humidity = max(entry['main']['humidity'] for entry in entries)# Максимальная влажность
       pressure = max(entry['main']['pressure'] for entry in entries)# Максимальное давление
       weather_statuses = [(entry['weather'][0]['description'], entry['weather'][0]['icon']) for entry in entries]# Список статусов и иконок
       most_common_status = Counter(weather_statuses).most_common(1)[0][0] # Самое часто встречающееся описание погоды
       data.append({
           'date': date,
           'max_temp': max_temp,
           'min_temp': min_temp,
           'humidity': humidity,
           'pressure': pressure,
           'status': most_common_status[0],
           # Мы не будем использовать ночные иконки погодных условий в нашем приложении, поэтому заменяем n (night) на d (day)
           'icon': most_common_status[1].replace('n', 'd'),
       })
   return data[1:]
# Эндпоинт для получения информации о городе по его названию
@app.get("/getCity")
async def getCity(сity):
   async with session.get(BASE_GEOCODER_URL + f'q={сity}&limit={1}') as r:
       data = await r.json()
   if data:
        print(data)
        first_match = data[0]
        lat = first_match["lat"]
        lon = first_match["lon"]
        return await getWeather(lat, lon)
   else:
        raise HTTPException(status_code=404, detail="Город не найден")
  
# Эндпоинт для получения прогноза и текущей погоды по координатам
@app.get("/getWeather")
async def getWeather(lat: float, lon: float):
   # Получение прогноза погоды на 5 дней вперед
   async with session.get(BASE_FORECAST_URL + f'lat={lat}&lon={lon}') as r:
       data = await r.json()
   forecast = get_grouped_weather_conditions(data)
   # Получение текущей погоды
   async with session.get(BASE_WEATHER_URL + f'lat={lat}&lon={lon}') as r:
       data = await r.json()
   current = {
       'status': data['weather'][0]['description'].capitalize(),
       'icon': data['weather'][0]['icon'].replace('n', 'd'),
       'temp': data['main']['temp'],
       'feels_like': data['main']['feels_like'],
       'humidity': data['main']['humidity'],
       'pressure': data['main']['pressure'],
       'wind_speed': data['wind']['speed'],
       'wind_deg': data['wind']['deg']
   }
   return {
       'forecast': forecast,
       'current': current,
       'lat': data['coord']['lat'],
       'lon': data['coord']['lon'],
       'location': data['name']
   }

# Запускаем приложение с использованием Uvicorn на 5973 порту
if __name__ == "__main__":
   uvicorn.run(
       "main:app",
       host="0.0.0.0",
       port=5973,
       log_level="debug"
   )