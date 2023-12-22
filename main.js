const searchButton = document.querySelector('.search_button');
const searchInputContainer = document.querySelector('#search_input_container');
const searchInput = document.querySelector('#search_input');
const showResponseButton = document.querySelector('#show_response_button');
const cancelButton = document.querySelector('#cancel_button');
const canvas = document.querySelector('#chart').getContext('2d');





async function mainfunc (city) {
    const linkforCoordinates = `https://geocode.maps.co/search?q=${city}`;

    const fetchData1 = await fetch(linkforCoordinates)
    .then(response => response.json());

    const linkTofetch = `https://api.open-meteo.com/v1/forecast?latitude=${+fetchData1[0].lat}&longitude=${+fetchData1[0].lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration`;

    const fetchData2 = await fetch(linkTofetch)
    .then(response => response.json())
    .then(recievedData => {

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
        }


        const hourlyTimeArr = recievedData.hourly.time.slice(0, 25);
        const hourlyTemperatureArr = recievedData.hourly.temperature_2m.slice(0, 25);

        const necessaryDataForChart = {
            x: hourlyTimeArr.filter(e => hourlyTimeArr.indexOf(e) % 2 === 0).map(e => e.slice(-5)),
            y: hourlyTemperatureArr.filter(e => hourlyTemperatureArr.indexOf(e) % 2 === 0),
        }

        updateChart(necessaryDataForChart)

        appendDataToHTML(necessaryDataForDOM);
    });
}

let createChart = () => {
    let myChart = new Chart(canvas, {
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

}

window.addEventListener('load', () => {
    if (!localStorage.getItem('city')) {
        mainfunc('Berlin');
    } else {
        let lastSearch = localStorage.getItem('city');
        mainfunc(lastSearch)
    }
});

document.addEventListener('click', (e) => {
    if (e.target === searchButton || e.target === searchButton.children[0] || e.target === searchButton.children[0].children[0]) {
        searchInputContainer.style.display = 'flex';
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

const myChart = createChart();



