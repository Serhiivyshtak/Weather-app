import {weatherCodes} from "./weatherCodes.js";

const searchButton = document.querySelector('.search_button');
const searchInputContainer = document.querySelector('#search_input_container');
const searchInput = document.querySelector('#search_input');
const showResponseButton = document.querySelector('#show_response_button');
const cancelButton = document.querySelector('#cancel_button');
const canvas = document.querySelector('#chart');
const ctx = canvas.getContext('2d');

async function mainfunc (city) {
    const linkforCoordinates = `https://geocode.maps.co/search?q=${city}&api_key=658b4c6242e59946313956mrg437ebb`;

    try {
        startLoadingAnimation();

        const fetchData1 = await fetch(linkforCoordinates)
        .then(response => response.json());
    
        const linkTofetch = `https://api.open-meteo.com/v1/forecast?latitude=${+fetchData1[0].lat}&longitude=${+fetchData1[0].lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration`;
    
        const fetchData2 = await fetch(linkTofetch)
        .then(response => response.json())
        .then(recievedData => {

            displayImages(recievedData);
    
            endLoadingAnimation();
    
            const fullCityNameString = fetchData1[0].display_name.split(',').slice(0, 2).join(',');
    
            let currentDate = formCurrentDate();
    
            let isDay = define_IsDayState(recievedData);
    
            let necessaryDataForDOM = {
                place: fullCityNameString,
                date_string: currentDate[1],
                temperature: recievedData.hourly.temperature_2m[currentDate[0]],
                max_temperature: recievedData.daily.temperature_2m_max[0],
                min_temperature: recievedData.daily.temperature_2m_min[0],
                feels_like: recievedData.hourly.apparent_temperature[currentDate[0]],
                day: isDay,
                wind_speed: recievedData.hourly.wind_speed_10m[currentDate[0]],
                humidity: recievedData.hourly.relative_humidity_2m[currentDate[0]],
                precipitation: recievedData.hourly.precipitation[currentDate[0]],
                clouds_cover: recievedData.hourly.cloud_cover[currentDate[0]],
                pressure: recievedData.hourly.pressure_msl[currentDate[0]],
                visibility: recievedData.hourly.visibility[currentDate[0]],
                dateDay1: recievedData.daily.time[0].slice(-5),
                maxTemperatureDay1: recievedData.daily.temperature_2m_max[0],
                minTemperatureDay1: recievedData.daily.temperature_2m_min[0],
                dateDay2: recievedData.daily.time[1].slice(-5),
                maxTemperatureDay2: recievedData.daily.temperature_2m_max[1],
                minTemperatureDay2: recievedData.daily.temperature_2m_min[1],
                dateDay3: recievedData.daily.time[2].slice(-5),
                maxTemperatureDay3: recievedData.daily.temperature_2m_max[2],
                minTemperatureDay3: recievedData.daily.temperature_2m_min[2],
                dateDay4: recievedData.daily.time[3].slice(-5),
                maxTemperatureDay4: recievedData.daily.temperature_2m_max[3],
                minTemperatureDay4: recievedData.daily.temperature_2m_min[3],
                dateDay5: recievedData.daily.time[4].slice(-5),
                maxTemperatureDay5: recievedData.daily.temperature_2m_max[4],
                minTemperatureDay5: recievedData.daily.temperature_2m_min[4],
                dateDay6: recievedData.daily.time[5].slice(-5),
                maxTemperatureDay6: recievedData.daily.temperature_2m_max[5],
                minTemperatureDay6: recievedData.daily.temperature_2m_min[5],
                dateDay7: recievedData.daily.time[6].slice(-5),
                maxTemperatureDay7: recievedData.daily.temperature_2m_max[6],
                minTemperatureDay7: recievedData.daily.temperature_2m_min[6],
            }
    
    
            const hourlyTimeArr = recievedData.hourly.time.slice(0, 25);
            const hourlyTemperatureArr = recievedData.hourly.temperature_2m.slice(0, 25);
    
            const necessaryDataForChart = {
                x: hourlyTimeArr.filter(e => hourlyTimeArr.indexOf(e) % 2 === 0).map(e => e.slice(-5)),
                y: hourlyTemperatureArr.filter(e => hourlyTemperatureArr.indexOf(e) % 2 === 0),
            }
            
            updateChart(necessaryDataForChart);
    
            appendDataToHTML(necessaryDataForDOM);
        });
    } catch (err) {
        writeError();
        endLoadingAnimation();
    }
}

let displayImages = (data) => {
    const dailyCodes = data.daily.weather_code;
    const currentCode = data.current.weather_code;

    const mainImageContainer = document.querySelector('#weather_image_container');
    const dayImageContainers = document.querySelectorAll('.day_weather_image_container');

    for (let i = 0; i < weatherCodes.length; i++) {
        if (weatherCodes[i].codes.includes(currentCode)) {
            mainImageContainer.innerHTML = weatherCodes[i].image;
        }

        for (let q = 0; q < dailyCodes.length; q++) {
            if (weatherCodes[i].codes.includes(dailyCodes[q])) {
                dayImageContainers[q].innerHTML = weatherCodes[i].image;
            }
        }
    }

}

let writeError = () => {
    const heading = document.querySelector('.element_to_append');
    heading.innerText = 'oops, can\'t find your city('
}

let startLoadingAnimation = () =>  {
    const elementsToAppend = document.querySelectorAll('.element_to_append');
    const loader = document.querySelector('#loader');

    loader.style.display = 'block';
    elementsToAppend[0].innerText = 'loading.. ';
    for (let i = 1; i < elementsToAppend.length; i++) {
        elementsToAppend[i].innerText = '';
    }
}

let endLoadingAnimation = () => {
    const loader = document.querySelector('#loader');

    loader.style.display = 'none';
}

let createChart = () => {
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [null],
            datasets: [{
                label: 'temperature(°C)',
                data: [null],
                borderWidth: 1,
                borderColor: '#ec90a9',
    
            }],
        },
    });
    return myChart;
}

let updateChart = (data) => {
    myChart.data.labels = data.x;
    myChart.data.datasets[0].data = data.y;

    myChart.update()
}

let formCurrentDate = () => {
    const now = new Date();
    const time = now.getHours();
    const options = {
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric',
    }

    return [time, now.toLocaleString('en-EN', options)];
}

let define_IsDayState = (data) => {
    let isDay;

    if (data.current.is_day === 0) {
        isDay = 'night';
    } else {
        isDay = 'day';
    }

    return isDay;
}

let appendDataToHTML = (data) => {
    const dataArr = Object.entries(data);

    const elementsToAppend = document.querySelectorAll('.element_to_append');

    for (let i = 0; i < elementsToAppend.length; i++) {
        elementsToAppend[i].innerText = dataArr[i][1];
    }


    return elementsToAppend;
}

window.addEventListener('load', () => {
    if (!localStorage.getItem('city')) {
        mainfunc('Berlin');
    } else {
        let lastSearch = localStorage.getItem('city');
        mainfunc(lastSearch)
    }
});

window.addEventListener('resize', () => {
    canvas.style = 'width: 100%';
});

document.addEventListener('click', (e) => {
    if (e.target === searchButton || e.target === searchButton.children[0] || e.target === searchButton.children[0].children[0]) {
        searchInputContainer.style.display = 'flex';
        searchInput.focus();
    }
    if (e.target === cancelButton) {
        searchInputContainer.style.display = 'none';
    }
    if (e.target === showResponseButton) {
        const typedValue = searchInput.value.trim();
        mainfunc(typedValue);
        searchInputContainer.style.display = 'none';
        searchInput.value = '';
        localStorage.setItem('city', typedValue);
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const typedValue = searchInput.value.trim();
        mainfunc(typedValue);
        searchInputContainer.style.display = 'none';
        searchInput.value = '';
        localStorage.setItem('city', typedValue);
    }
});

const myChart = createChart();
