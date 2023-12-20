const searchButton = document.querySelector('.search_button');
const searchInputContainer = document.querySelector('#search_input_container');
const searchInput = document.querySelector('#search_input');
const showResponseButton = document.querySelector('#show_response_button');
const cancelButton = document.querySelector('#cancel_button');

let mainfunc = (city) => {
    const linkforCoordinates = `https://geocode.maps.co/search?q=${city}`;
    fetch(linkforCoordinates, {
        method: 'GET'
    })
        .then((recivedCoordinates) => {
            return recivedCoordinates.json();
        })
        .then((parsedCoordinates) => {
            const fullCityNameString = parsedCoordinates[0].display_name.split(',').slice(0, 2).join(',');

            const linkTofetch = `https://api.open-meteo.com/v1/forecast?latitude=${+parsedCoordinates[0].lat}&longitude=${+parsedCoordinates[0].lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration`;

            fetch(linkTofetch, {
                method: 'GET',
            })
                .then((data) => {
                    return data.json();
                }).then((parsedData) => {
                    const now = new Date();
                    let time = now.getHours();
                    const options = {
                        day: 'numeric',
                        month: 'long',
                        hour: 'numeric',
                        minute: 'numeric',
                    }
                    let dateString = now.toLocaleString('en-EN', options);

                    let isDay;

                    if (parsedData.current.is_day === 0) {
                        isDay = 'night';
                    } else {
                        isDay = 'day';
                    }
                    // makeChart(parsedData.hourly.time.slice(0, 10), parsedData.hourly.temperature_2m.slice(0, 10), parsedData.hourly.apparent_temperature.slice(0, 10))

                    let neededData = {
                        place: fullCityNameString,
                        date_string: dateString,
                        temperature: parsedData.hourly.temperature_2m[time],
                        max_temperature: parsedData.daily.temperature_2m_max[0],
                        min_temperature: parsedData.daily.temperature_2m_min[0],
                        feels_like: parsedData.hourly.apparent_temperature[time],
                        day: isDay,
                        wind_speed: parsedData.hourly.wind_speed_10m[time],
                        humidity: parsedData.hourly.relative_humidity_2m[time],
                        precipitation: parsedData.hourly.precipitation[time],
                        clouds_cover: parsedData.hourly.cloud_cover[time],
                        pressure: parsedData.hourly.pressure_msl[time],
                        visibility: parsedData.hourly.visibility[time],
                    }

                    appendDataToHTML(neededData);
                });
        });

}

let makeChart = (x, y, additionalY) => {
    const canvas = document.querySelector('canvas').getContext('2d');

    let myChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: x,
            datasets: [{
                label: 'temperature(°C)',
                data: y,
                borderWidth: 1,
                borderColor: '#ec90a9',

            },
            {
                label: 'feels like(°C)',
                data: additionalY,
                borderWidth: 1,
                borderColor: 'white',

            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    return myChart;
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
        anyfunc('Berlin');
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

