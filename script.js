let hour;
let minute;
let second;
const url= 'https://www.timeapi.io/api/Time/current/zone?timeZone=';
const selectButton = document.getElementById('selectButton');
let currLocation = 'Europe/London';
let map; // Global variable to store the map instance
let clickMarker; // To store the marker for clicked location
let selectedCoords = null;
const mapButton = document.getElementById('select-map-button');

function initializeMap() {
    // Create map centered on the world
    map = L.map('map').setView([20, 0], 2);
    
    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    // Set up click handler
    setupMapClickHandler();
}
function setupMapClickHandler() {
    map.on('click', function(e) {
        const coords = e.latlng; // Leaflet LatLng object
        const lat = coords.lat.toFixed(4);
        const lng = coords.lng.toFixed(4);
        
        // Remove previous marker if exists
        if (clickMarker) {
            map.removeLayer(clickMarker);
        }
        
        // Add new marker at clicked location
        clickMarker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`Selected: ${lat}, ${lng}`)
            .openPopup();
        
        // Return coordinates (can also use them directly)
        console.log(`Latitude: ${lat}, Longitude: ${lng}`);
        selectedCoords= { lat, lng };
    });
}
mapButton.addEventListener('click', async() => {
    if(!selectedCoords) alert('Please select a location on the map first.');
    else {
        const lat = selectedCoords.lat;
        const lng = selectedCoords.lng;
        
        try{
            const response = await fetch(`http://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=demo`)
            if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`); 
            const data = await response.json();
            console.log("API Response:", data); 
            if(!data || !data.time || !data.timezoneId) {
                throw new Error('Incomplete time data received');
                    }   
            
            const timeString = data.time;
            console.log(`Time at ${lat}, ${lng}: ${timeString}`);
            const timeParts = data.time.split(' ')[1]?.split(':');
            if(!timeParts || timeParts.length !== 3) {
                throw new Error('Invalid time format');
                }
            
            // 4. Update time variables
            hour = parseInt(timeParts[0], 10);
            minute = parseInt(timeParts[1], 10);
            second = parseInt(timeParts[2], 10);
            currLocation = data.timezoneId || `Location (${lat}, ${lng})`;
            console.log(` ${hour}:${minute}:${second} in ${currLocation}`);
            updateClock();
        }catch(error){
            console.error('Error:', error);
        } 
    }
})
// Function to fetch all available timezones
const allTimeZones = async() => {
    try {
        const response = await fetch('https://timeapi.io/api/TimeZone/AvailableTimeZones');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const timezones = await response.json();
        return timezones;
    } catch (error) {
        console.error('Error fetching timezones:', error);
    }
}
// Create the clock numbers and dots
document.addEventListener('DOMContentLoaded', () => {
    const clockNumbers = document.querySelector('.nums');
    const radius = 120; 
    
    for (let i = 1; i <= 12; i++) {
        const clockNumber = document.createElement('div'); 
        clockNumber.textContent = i;
        clockNumber.classList.add('clock-number');
        
        const angle = (i * 30) * (Math.PI / 180); 
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;

        if(i%3===0)
            clockNumber.style.fontSize = "1.7em";
        
        clockNumber.style.transform = `translate(${x}px, ${y}px)`;
        clockNumbers.appendChild(clockNumber);
        updateCurrentTime(currLocation);
    }
    for (let i = 0; i < 60; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if(i%5 === 0) {
            continue; // Skip every 5th dot
        }
        const angle = (i * 6) * (Math.PI / 180); 
        const x = Math.sin(angle) * (radius +15);
        const y = -Math.cos(angle) * (radius +15);

        dot.style.transform = `translate(${x}px, ${y}px)`;
        clockNumbers.appendChild(dot);
         // Initialize the map when the DOM is loaded
    }
    initializeMap();
});
// Event listener for the select button
// This will fetch the timezone based on the city input and update the clock
selectButton.addEventListener('click',async() => {
    const cityInput = document.getElementById('cityInput');
    let inputString = cityInput.value.trim();
    try{
        const allZonesString = await allTimeZones();
        if (JSON.stringify(allZonesString).includes(inputString)) {
            currLocation = inputString;
            updateCurrentTime(currLocation);
        }else{
            alert('Invalid city name or timezone. Please try again.');
        }
    }catch(error){
        console.error('Error:', error);
        alert('An error occurred while fetching the timezone. Please try again later.');
    }

});

// Function to update the current time based on the selected location
async function updateCurrentTime(LocationName){
    
    try {
        const response = await fetch(url+LocationName);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const timeData = await response.json();
        console.log(timeData);
    
        hour = timeData.hour;
        minute = timeData.minute;
        second = timeData.seconds;        

        document.querySelector('.digital-time').textContent = `${hour}:${minute}:${second}`;
        document.querySelector('.timezone-display').innerHTML = `${LocationName} `;
        updateClock();
    }
    catch (error) {
        console.error('Error fetching time:', error);
    } 
}
// Function to update the clock hands based on the current time
function updateClock() {
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');

    const hourDeg = (hour % 12) * 30 + (minute / 60) * 30;
    const minuteDeg = minute * 6 + (second / 60) * 6;
    const secondDeg = second * 6;

    hourHand.style.transform = `rotate(${hourDeg+90}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg+90}deg)`;
    secondHand.style.transform = `rotate(${secondDeg+90}deg)`;
}
// Function to increment the time every second
function tick(){
        second++;
        if(second >= 60){
            second = 0;
            minute++;
            if(minute >= 60){
                minute = 0;
                hour++;
                if(hour >= 24){
                    hour = 0;
                }
            }
        }
        document.querySelector('.digital-time').textContent = 
        `${formatTwoDigits(hour)}:${formatTwoDigits(minute)}:${formatTwoDigits(second)}`;        updateClock();
}
// Function to format numbers to two digits
function formatTwoDigits(num) {
    return num < 10 ? `0${num}` : `${num}`;
}

setInterval(tick, 1000);
