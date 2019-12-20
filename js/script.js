// needs improvement; will not properly denote trains going to Foxboro, Stoughton, Rockport, or Plymouth. It will also not properly denote trains not following the entire route,
// such as trains that terminate at Providence, Framingham or Reading rather than Wickford Junction, Worcester or Haverhill.
function determineDestination(route) {
    const dayOfWeek = new Date(Date.now()).getDay();
    switch(route.relationships.route.data.id) {
        case "CR-Fitchburg": return "Wachusett";
        case "CR-Haverhill": return "Haverhill";
        case "CR-Lowell": return "Lowell"; // Some Haverhill Line trains use the Lowell Line until splitting via the Wildcat Branch.
        case "CR-Newburyport": return "Newburyport or Rockport"; // Service to Newburyport and Rockport split at Beverly Depot.
        case "CR-Greenbush": return "Greenbush";
        case "CR-Middleborough": return "Middleborough/Lakeville";
        case "CR-Kingston": return "Kingston, MA or Plymouth"; // Most Kingston/Plymouth trains serve only Kingston, MA due to lack of a Wye. Some Kingston trains reverse direction to serve Plymouth.
        case "CR-Fairmount": return "Readville, Forge Park/495 or Foxboro"; // Some Fairmount trains continue onto Forge Park/495 or Foxboro as CR-Franklin line trains
        case "CR-Franklin": return "Forge Park/495 or Foxboro"; // Foxboro trains use the Franklin line up until splitting at Wapole.
        case "CR-Worcester": return "Worcester"; // Some Worcester Line trains short-turn at Framingham
        case "CR-Foxboro": return "Foxboro"; // Used by Foxboro Event Patriot's Trains; Normal service to Foxboro uses 'CR-Fairmount' or 'CR-Franklin'
        case "CR-Providence":
            // if the current day of the week is not Sunday or Saturday
            if(dayOfWeek !== 0 && dayOfWeek !== 6) {
                return "Wickford Junction or Stoughton"; // Some Providence branch trains do not continue onto Wickford Junction, making their last stop at Providence. Stoughton trains split at Canton Junction.
            } else {
                return "Providence"; // Stoughton, T.F. Green Airport, and Wickford Junction do not have weekend service, so all CR-Providence trains terminate at Providence.
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
    return "TBA";
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
            destinationElement.textContent = determineDestination(trackStation[i]);
            departureTimeElement.textContent = displayTime(new Date(departureTime));
            trainStatusElement.textContent = trackStation[i].attributes.status;
            trainNumberElement.textContent = displayTrainNumber(trackStation[i].relationships.vehicle.data);
            trackNumberElement.textContent = (stationData.length > 1)?(parseFloat(stationData[1])):("TBA");

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

function makeRequest() {

    console.log('updating board...');

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

makeRequest();

setInterval(() => {
   makeRequest() 
}, 10000);
