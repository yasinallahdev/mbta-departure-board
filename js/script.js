const northTrainBoard = document.querySelector('#trainBoardNorth');
const southTrainBoard = document.querySelector('#trainBoardSouth');

// needs improvement; will not properly denote trains going to Foxboro, Stoughton, Rockport, or Plymouth. It will also not properly denote trains not following the entire route,
// such as trains that terminate at Providence, Framingham or Reading rather than Wickford Junction, Worcester or Haverhill.
function determineDestination(route) {
    const dayOfWeek = new Date(Date.now()).getDay();
    switch(route.relationships.route.data.id) {
        case "CR-Fitchburg": return "Wachusett";
        case "CR-Haverhill": return "Haverhill";
        case "CR-Lowell": return "Lowell";
        case "CR-Newburyport": return "Newburyport or Rockport";
        case "CR-Greenbush": return "Greenbush";
        case "CR-Middleborough": return "Middleborough/Lakeville";
        case "CR-Kingston": return "Kingston";
        case "CR-Fairmount": return "Readville, Forge Park/495 or Foxboro";
        case "CR-Franklin": return "Forge Park/495 or Foxboro";
        case "CR-Worcester": return "Worcester";
        case "CR-Providence":
            // if the current day of the week is not Sunday or Saturday
            if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                return "Wickford Junction or Stoughton";
            } else {
                return "Providence"; // Stoughton, T.F. Green Airport, and Wickford Junction do not have weekend service, so all CR-Providence trains terminate at Providence.g
            }
        case "CR-Needham": return "Needham Heights";
        default: return "Unknown";
    }
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
    return "TBA"
}

function trackForStation(trackStation, trainBoard) {
    for(let i = 0; (i < trackStation.length) && (i < 10); i++) {
            
        const stationData = trackStation[i].relationships.stop.data.id.split('-');

        const newTableRow = document.createElement('tr');

        const carrierElement = document.createElement('td');
        const departureTimeElement = document.createElement('td');
        const destinationElement = document.createElement('td');
        const trainNumberElement = document.createElement('td');
        const trackNumberElement = document.createElement('td');
        const trainStatusElement = document.createElement('td');
        const departureTime = trackStation[i].attributes.departure_time;

        console.log(`Train heading to ${determineDestination(trackStation[i])} at ${displayTime(new Date(departureTime))}`);
        console.log(departureTime);

        carrierElement.textContent = "MBTA"; // todo: Add Display for Amtrak Northeast Regional/Acela Express/Lake Shore Limited/Downeaster Trains
        destinationElement.textContent = determineDestination(trackStation[i]);
        departureTimeElement.textContent = displayTime(new Date(departureTime));
        trainStatusElement.textContent = trackStation[i].attributes.status;
        trainNumberElement.textContent = displayTrainNumber(trackStation[i].relationships.vehicle.data);
        trackNumberElement.textContent = (stationData.length > 1)?(stationData[1]):("TBA");

        newTableRow.appendChild(carrierElement);
        newTableRow.appendChild(departureTimeElement);
        newTableRow.appendChild(destinationElement);
        newTableRow.appendChild(trainNumberElement);
        newTableRow.appendChild(trackNumberElement);
        newTableRow.appendChild(trainStatusElement);

        trainBoard.appendChild(newTableRow);

    }
}

fetch('https://api-v3.mbta.com/predictions/?stop=place-north,place-sstat&route=CR-Fitchburg,CR-Haverhill,CR-Lowell,CR-Newburyport,CR-Greenbush,CR-Middleborough,CR-Kingston,CR-Fairmount,CR-Franklin,CR-Worcester,CR-Providence,CR-Needham')
    .then(res => res.json())
    .then(response => {
        const filteredNorthStations = response.data.filter(elem => {
            return (elem.relationships.stop.data.id.includes("North Station")) && (elem.attributes.departure_time !== null ? true : false);
        });

        const filteredSouthStations = response.data.filter(elem => {
            if(elem.relationships.stop.data.id.includes("South Station")) {            
                console.log(elem);
                return (elem.attributes.departure_time !== null ? true : false);
            } else {
                return false;
            }
        });
        const sortedNorthStations = filteredNorthStations.sort((a, b) => new Date(a.attributes.departure_time) - new Date(b.attributes.departure_time));
        const sortedSouthStations = filteredSouthStations.sort((a, b) => new Date(a.attributes.departure_time) - new Date(b.attributes.departure_time));
        trackForStation(sortedNorthStations, northTrainBoard);
        trackForStation(sortedSouthStations, southTrainBoard);
        
        setTimeout(() => {
            window.location.reload()
        }, 10000)
    });
