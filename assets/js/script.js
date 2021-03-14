let searchAreaEl= document.querySelector(".searchArea");
let submitButtonEl = document.querySelector(".submitSearch");
let currentWeatherEl = document.querySelector(".currentWeather");
var apiKey = "b04af3f011ed66d16375944498e2e4d9";

// Declare variables for current weather and forecast data objects to be manipulated later
let requestedWeatherData;

// Function to delete the generated li element in the history
function deleteHistory(event){
    event.stopPropagation();
    let cityLiEl = event.target;
    cityLiEl.parentElement.parentElement.remove();
}
// Function to build the 5 day forecast
function buildForecast(){
    let forecast = buildHTML("section", "d-flex flex-wrap justify-content-center align-content-center col-12 mt-5 forecast");
    currentWeatherEl.appendChild(forecast);

    let forecastHeader = buildHTML("div", "col-12");
    forecast.appendChild(forecastHeader);
    forecastHeader.appendChild(buildHTML("h4", "forecast-title d-flex flex-column align-items-center", "Your 5-Day Forecast"));
    
    for (let i = 1; i < 6; i++){
        let forecastCard = buildHTML("div", "card d-flex flex-column align-items-center col-6 col-lg-8 m-2");
        forecastCard.setAttribute("style", "width: 15rem;");
        forecast.appendChild(forecastCard);

        // Convert the timestamps to YYYY-MM-DD
        let forecastDateRaw = new Date(requestedWeatherData.dailyForecast[i].dt*1000);
        let forecastDate = forecastDateRaw.toLocaleDateString("en");

        forecastCard.appendChild(buildHTML("h5", "card-title", forecastDate));
        
        let weatherIcon = `https://openweathermap.org/img/wn/${requestedWeatherData.dailyForecast[i].weather[0].icon}@2x.png`
        let weatherIconEl = buildHTML("img", "col-4 weather-img");
        weatherIconEl.setAttribute("src", weatherIcon);
        forecastCard.appendChild(weatherIconEl);

        forecastCard.appendChild(buildHTML("p", "temperature", `Temperature: ${requestedWeatherData.dailyForecast[i].temp.day} C`));
        forecastCard.appendChild(buildHTML("p", "humidity", `Humidity: ${requestedWeatherData.dailyForecast[i].humidity}%`));
    }
}
// Function to build city weather card
function buildWeatherDiv(){
    let selectedCity = buildHTML("div", "col-12 col-lg-8 selected-city");
    currentWeatherEl.appendChild(selectedCity);
    let card = buildHTML("div", "card");
    selectedCity.appendChild(card);
    let cardBody = buildHTML("div", "card-body d-flex flex-column justify-content-center");
    card.appendChild(cardBody);

    cardBody.appendChild(buildHTML("h2", "card-title", `${requestedWeatherData.cityName}`));

    let currentDateRaw = new Date(requestedWeatherData.dailyForecast[0].dt*1000);
    let currentDate = currentDateRaw.toLocaleDateString("en");
    cardBody.appendChild(buildHTML("h5", "current-date", `${currentDate}`));

    let weatherIcon = `https://openweathermap.org/img/wn/${requestedWeatherData.dailyForecast[0].weather[0].icon}@2x.png`
    let weatherIconEl = buildHTML("img", "col-1 weather-img");
    weatherIconEl.setAttribute("src", weatherIcon);
    cardBody.appendChild(weatherIconEl);

    cardBody.appendChild(buildHTML("p", "temperature", `Temperature: ${requestedWeatherData.currentTemp}`));
    cardBody.appendChild(buildHTML("p", "humidity", `Humidity: ${requestedWeatherData.currentHumidity}`));
    cardBody.appendChild(buildHTML("p", "windspeed", `Wind Speed: ${requestedWeatherData.currentWind}`));

    let uvIndex = requestedWeatherData.currentUVI <= 3 ? "UVindex-low p-2" : requestedWeatherData.currentUVI <= 7 ? "UVindex-med p-2" : "UVindex-high p-2";
    cardBody.appendChild(buildHTML("p", uvIndex, `UV Index: ${requestedWeatherData.currentUVI}`));
}

//function to create HTML elements
function buildHTML(tag, classes, text){
    const element = document.createElement(tag);
    element.className = classes;
    element.textContent = text;
    return element;
}

// Async function to get the weather data we need
async function callWeather(location){
    // Fetch Current Weather API
    let currentWeatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
    let weatherJSON = await currentWeatherData.json();

    // Get longitude and latitude from Current Weather API, passes it to the One Call API for daily forecasts and UV Index
    let latitude = weatherJSON.coord.lat;
    let longitude = weatherJSON.coord.lon;

    // Fetch One Call API, using latitude and longitude from Current Weather API
    let oneCallAPI = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&exclude=current,minutely,hourly,alerts&appid=${apiKey}`)
    let oneCallJSON = await oneCallAPI.json();

    // Build Object with all the data we need
    requestedWeatherData = {
        cityName: weatherJSON.name,
        currentDate: new Date(weatherJSON.dt*1000),
        currentTemp: `${weatherJSON.main.temp} C`,
        currentHumidity: `${weatherJSON.main.humidity}%`,
        currentWind: `${weatherJSON.wind.speed} km/h`,
        currentUVI: oneCallJSON.daily[0].uvi,
        dailyForecast: oneCallJSON.daily
    }
}

// Function to search for a city
async function searchCity(){
    let searchValue = searchAreaEl.value;
    await callWeather(searchValue)
        .catch(() => {
            alert("Not a valid city!!");
            return;
        });
    buildWeatherDiv();
    buildForecast();
    searchAreaEl.value = "";
}

// Event Listener for search button
submitButtonEl.addEventListener("click", (event)=>{
    event.preventDefault();
    searchCity();
});
