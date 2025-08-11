const citysearch = document.querySelector('.search-city');
const searchb = document.querySelector('.search-btn');
const apikey = '13fbaa38447b19d9001804049ad8c43f';
const notfound = document.querySelector('.nf');
const citysearcher = document.querySelector(".sc");
const winfor = document.querySelector('.winfo'); 
let countrytxt = document.querySelector('.ct');
let temper = document.querySelector('.t-txt');
let hvtxt = document.querySelector(".hvt");
let image = document.querySelector('.wer');
let datenow = document.querySelector('.ctd');
let windspeedtxt = document.querySelector(".wvt");
let forecastItemContainer = document.querySelector(".fic-container");
let weathertxt = document.querySelector('.ct.regular-txt');  // النص الخاص بحالة الطقس

searchb.addEventListener('click', () => {
    const city = citysearch.value.trim();
    if (city !== '') {
        updateWeatherInfo(city);
        citysearch.value = '';
        citysearch.blur();
    }
});

citysearch.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const city = citysearch.value.trim();
        if (city !== '') {
            updateWeatherInfo(city);
            citysearch.value = '';
            citysearch.blur();
        }
    }
});

// دالة بسيطة تحدد لغة النص بناءً على الحروف
function detectLanguage(text) {
    // لو فيه حروف عربية رجع 'ar'
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    // لو فيه حروف لاتينية رجع 'en'
    if (/[a-zA-Z]/.test(text)) return 'en';
    // لو مش واضح، رجع 'en' كافتراضي
    return 'en';
}

async function getFetchData(endPoint, city, lang) {
    const apiurl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric&lang=${lang}`;
    const response = await fetch(apiurl);
    return response.json();
}

function getcurrentdate() {
    const options = {
        weekday: "short",
        day: '2-digit',
        month: "short"
    }
    return new Date().toLocaleDateString('en-GB', options);
}

function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return "assets/weather/thunderstorm.svg";
    if (id >= 300 && id <= 321) return "assets/weather/drizzle.svg";
    if (id >= 500 && id <= 531) return "assets/weather/rain.svg";
    if (id >= 600 && id <= 622) return "assets/weather/snow.svg";
    if (id >= 701 && id <= 781) return "assets/weather/atmosphere.svg";
    if (id === 800) return "assets/weather/clear.svg";
    if (id >= 801 && id <= 804) return "assets/weather/clouds.svg";
    return "assets/weather/default.png";
}

async function updateWeatherInfo(city) {
    const lang = detectLanguage(city);
    const weatherData = await getFetchData('weather', city, lang);
    if (weatherData.cod != 200) { 
        return showScreenSection(notfound);
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, description }],
        wind: { speed }
    } = weatherData;

    countrytxt.textContent = country;
    temper.textContent = `${Math.round(temp)} °C`;
    hvtxt.textContent = `${humidity}%`;
    windspeedtxt.textContent = `${speed.toFixed(2)} m/s`;
    image.src = getWeatherIcon(id);
    datenow.textContent = getcurrentdate();
    weathertxt.textContent = description.charAt(0).toUpperCase() + description.slice(1);

    await updateForecastInfo(city, lang);
    showScreenSection(winfor);
}

async function updateForecastInfo(city, lang) {
    const forecastData = await getFetchData('forecast', city, lang);
    const timetaken = '12:00:00';
    const todayDate = new Date().toISOString().split("T")[0];
    
    forecastItemContainer.innerHTML = '';
    forecastData.list.forEach(forecastWeather => {
        if (
            forecastWeather.dt_txt.includes(timetaken) && 
            !forecastWeather.dt_txt.includes(todayDate)
        ) {
            updateForecastItems(forecastWeather);
        }
    });
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOptions = {
        day: '2-digit',
        month: 'short'
    };
    const dateresult = dateTaken.toLocaleDateString('en-US', dateOptions);
    const temperature = `${Math.round(temp)}°C`;

    const forecastItem = `
        <div class="fic">
            <h5 class="fid">${dateresult}</h5>
            <img src="${getWeatherIcon(id)}" class="fii" alt="Weather Icon" />
            <h5 class="fit">${temperature}</h5>
        </div>
    `;

    forecastItemContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showScreenSection(Section) {
    [winfor, citysearcher, notfound].forEach(sec => sec.style.display = 'none'); 
    Section.style.display = 'flex';
}
