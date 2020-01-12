const timeDisplay = document.querySelector('#currentTime');

// needs improvement; will not properly denote trains going to Foxboro, Stoughton, Rockport, or Plymouth. It will also not properly denote trains not following the entire route,
// such as trains that terminate at Providence, Framingham or Reading rather than Wickford Junction, Worcester or Haverhill.
async function determineDestination(route) {
    
    let finalDestination = "";

    console.log("final destination");
    console.log(route);
    console.log(`https://api-v3.mbta.com/routes/${route}`);

    await fetch(`https://api-v3.mbta.com/routes/${route}`)
        .then(res => res.json())
        .then(response => {
            finalDestination = response.data.data.attributes.direction_destinations[0];
        })

    return finalDestination;

}

function displayTime(time) {
    let hour = time.getHours();
    let minutes = time.getMinutes();
    let suffix = "AM";
    if(hour > 11) {
        hour -= 12;
        suffix = "PM";
    }
    if(hour === 0) {
        hour = 12;
    }
    if(minutes < 10) {
        minutes = `0${minutes}`;
    }
    return `${hour}:${minutes} ${suffix}`
}

function displayTrainNumber(vehicleData) {
    if(vehicleData) {
        const vehicleID = parseFloat(vehicleData.id);
        if(!isNaN(vehicleID)) {
            return vehicleID;
        }
    }
    return "TBD";
}

function trackForStation(trackStation, rowPrefix) {
    for(let i = 0; i < 10; i++) {
            
        const targetTableRow = document.querySelector(`#${rowPrefix}row${i}`);

        const carrierElement = targetTableRow.querySelectorAll('td')[0];
        const departureTimeElement = targetTableRow.querySelectorAll('td')[1];
        const destinationElement = targetTableRow.querySelectorAll('td')[2];
        const trainNumberElement = targetTableRow.querySelectorAll('td')[3];
        const trackNumberElement = targetTableRow.querySelectorAll('td')[4];
        const trainStatusElement = targetTableRow.querySelectorAll('td')[5];

        if( i < trackStation.length ) {
            
            const stationData = trackStation[i].relationships.stop.data.id.split('-');
            const departureTime = trackStation[i].attributes.departure_time;

            carrierElement.textContent = "MBTA"; // todo: Add Display for Amtrak Northeast Regional/Acela Express/Lake Shore Limited/Downeaster Trains
            console.log(trackStation[i]);
            destinationElement.textContent = determineDestination(trackStation[i]);
            departureTimeElement.textContent = displayTime(new Date(departureTime));
            trainStatusElement.textContent = trackStation[i].attributes.status;
            trainNumberElement.textContent = displayTrainNumber(trackStation[i].relationships.vehicle.data);
            trackNumberElement.textContent = (stationData.length > 1)?(parseFloat(stationData[1])):("TBD");

        } else {
            carrierElement.textContent = "";
            destinationElement.textContent = "";
            departureTimeElement.textContent = "";
            trainStatusElement.textContent = "";
            trainNumberElement.textContent = "";
            trackNumberElement.textContent = "";
        }

    }
}

function updateBoard() {

    timeDisplay.textContent = displayTime(new Date(Date.now()));

    fetch('https://api-v3.mbta.com/predictions/?stop=place-north,place-sstat&route=CR-Fitchburg,CR-Haverhill,CR-Lowell,CR-Newburyport,CR-Greenbush,CR-Middleborough,CR-Kingston,CR-Fairmount,CR-Franklin,CR-Worcester,CR-Providence,CR-Needham')
        .then(res => res.json())
        .then(response => {
            const filteredNorthStations = response.data.filter(elem => {
                return (elem.relationships.stop.data.id.includes("North Station")) && (elem.attributes.departure_time !== null ? true : false);
            });

            const filteredSouthStations = response.data.filter(elem => {
                return (elem.relationships.stop.data.id.includes("South Station")) && (elem.attributes.departure_time !== null ? true : false);
            });
            const sortedNorthStations = filteredNorthStations.sort((a, b) => new Date(a.attributes.departure_time) - new Date(b.attributes.departure_time));
            const sortedSouthStations = filteredSouthStations.sort((a, b) => new Date(a.attributes.departure_time) - new Date(b.attributes.departure_time));
            trackForStation(sortedNorthStations, 'n');
            trackForStation(sortedSouthStations, 's');
            
    });

}

updateBoard();

setInterval(() => {
    updateBoard() 
}, 10000);
