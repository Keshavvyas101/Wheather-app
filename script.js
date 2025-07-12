const URL = "https://api.openweathermap.org/data/2.5/weather?q=&appid=7311f0c0068d4e2d6ec6ed9c786db465";

let inputCountry = "";
let placeName = "";

const weatherIcon = document.querySelector("#weather-icon");
const temperature = document.querySelector("#temperature");
const feelsLike = document.querySelector("#feels-like");
const description = document.querySelector("#description");
const date = document.querySelector("#date");
const city = document.querySelector("#city");

const minTempValue = document.querySelector("#min-temp");
const maxTempValue = document.querySelector("#max-temp");
const humidityValue = document.querySelector("#humidity-value");
const windSpeedValue = document.querySelector("#wind-speed-value");
const sunriseTime = document.querySelector("#sunrise-time");
const sunsetTime = document.querySelector("#sunset-time");
const cloudsValue = document.querySelector("#clouds-value");
const pressureValue = document.querySelector("#pressure-value");

const searchButton = document.querySelector("#search-box i");

const weekDays = document.querySelectorAll(".this-week-box");

async function setValues(placeName) {
    placeName = placeName.toLowerCase();
    let weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${placeName}&appid=7311f0c0068d4e2d6ec6ed9c786db465`;
    let response = await fetch(weatherURL);
    const weatherData = await response.json();

    console.log(weatherData);

    setInputContentValues(weatherData,placeName);
    setHighlightsValues(weatherData);
    setWeekData(placeName);
}
setValues("Delhi");


function setInputContentValues(weatherData,placeName){
    let iconCode = weatherData.weather[0].icon;
    // let weatherIcon = `https://openweathermap.org/img/wn/${data.icon}@4x.png`;
    let iconURL = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    weatherIcon.innerHTML = `<img src="${iconURL}" alt="Weather Icon">`;
    temperature.innerHTML = `${(weatherData.main.temp - 273.15).toFixed(2)}&deg;C`;
    
    let feelsLikeTemp = (weatherData.main.feels_like - 273.15).toFixed(2);
    feelsLike.innerHTML = `Feels like ${feelsLikeTemp}&deg;C`;
    date.innerText = formatDateIST(weatherData.dt);
    city.innerText = capitalizeWords(placeName) + " " + weatherData.sys.country;
}


function setHighlightsValues(weatherData){
    humidityValue.innerText = weatherData.main.humidity + " %";
    windSpeedValue.innerText = weatherData.wind.speed + " m/s";
    
    let sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
    let sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
    sunriseTime.innerText = sunrise;
    sunsetTime.innerText = sunset;

    cloudsValue.innerText = weatherData.clouds.all + " %";
    // uvIndexValue.innerText = weatherData.
    pressureValue.innerText = weatherData.main.pressure + " hpa";
}


searchButton.addEventListener("click", ()=>{
    inputCountry = document.querySelector("#search-box input");
    if(inputCountry!=""){
        placeName = inputCountry.value;
        inputCountry.value = "";
        console.log(placeName);
        setValues(placeName);
    }
});


function formatDateIST(unixTimestamp) {
    let date = new Date(unixTimestamp * 1000); // Convert to milliseconds

    // Convert to IST (UTC +5:30)
    let istDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",   // Full day name (e.g., Wednesday)
        day: "numeric",    // Date (e.g., 3)
        month: "long",     // Full month name (e.g., March)
        hour: "2-digit",   // 12-hour format hour
        minute: "2-digit", // Minute
        hour12: true,      // Enable 12-hour format
        timeZone: "Asia/Kolkata"
    }).format(date);

    // Replace the comma between date and time with "at"
    return istDate.replace(",", " at");
}


function capitalizeWords(str) {
    return str.split(" ") // Split string into words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
              .join(" "); // Join words back into a string
}


async function setWeekData(placeName){
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${placeName}&appid=7311f0c0068d4e2d6ec6ed9c786db465&units=metric`;
    let response = await fetch(forecastURL);
    let forecastData = await response.json();

    console.log(forecastData);
    minTempValue.innerText = `${forecastData.list[0].main.temp_min.toFixed(2)}°C`;
    maxTempValue.innerText = `${forecastData.list[0].main.temp_max.toFixed(2)}°C`;

    displayForecast(forecastData.list);
}


function displayForecast(dailyForecast) {
    let dailyData = {}; 

    dailyForecast.forEach((item) => {
        let date = new Date(item.dt * 1000).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

        // Store only one forecast entry per day
        if (!dailyData[date]) {
            dailyData[date] = {
                temp: item.main.temp.toFixed(1),
                description: item.weather[0].description,
                icon: item.weather[0].icon
            };
        }
    });

    let index = 0; // Track index for weekdays

    Object.entries(dailyData).forEach(([date, data]) => {
        if(index==0){
            index++;
            return;
        }
        if (index <= weekDays.length) { // Prevent out-of-bounds errors
            let weatherIcon = `https://openweathermap.org/img/wn/${data.icon}.png`;

            weekDays[index-1].innerHTML = `
                <h3>${date}</h3>
                <img src="${weatherIcon}" alt="Weather Icon">
                <p>${data.temp}°C</p>
                <p>${data.description}</p>
            `;

            index++; // Move to the next weekday item
        }
    });
}