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
        updateCurrentTime(url + '/Europe/London'); // Default timezone
    }
});

let hour;
let minute;
let second;
let url= 'https://worldtimeapi.org/api/timezone';

async function updateCurrentTime(url){
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const timeData = await response.json();
        
        const dateTime = new Date(timeData.datetime);
        
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();
        const second = dateTime.getSeconds();

        document.querySelector('.digital-time').textContent = `${hour}:${minute}:${second}`;
        updateClock();
    }
    catch (error) {
        console.error('Error fetching time:', error);
    } 
}
function updateClock() {
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');

    const hourDeg = (hour % 12) * 30 + (minute / 60) * 30;
    const minuteDeg = minute * 6 + (second / 60) * 6;
    const secondDeg = second * 6;

    hourHand.style.transform = `rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
}
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
        document.querySelector('.digital-time').textContent = `${hour}:${minute}:${second}`;
        updateClock();
}
setInterval(tick, 1000);