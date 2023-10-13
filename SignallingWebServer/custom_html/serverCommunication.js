var myHeaders = new Headers();
myHeaders.append("Authorization", "bearer none"); // Insert API Token here

var requestOptions = {
    method: "GET",
    headers: myHeaders,
};

fetch("https://vds-cms.vrtxlabs.cloud/api/projects/10/?populate[0]=rooms", requestOptions)
    .then((response) => response.text())
    .then((result) => parseResponse(result))
    .catch((error) => console.log("error", error));

function parseResponse(jsonData) {
    if (jsonData === null) {
        console.error("No data received");
        return;
    }

    // Initialize arrays for each value
    const daylightScoreArray = [];
    const airRenewalTimeArray = [];
    const ventilationScoreArray = [];
    const daylightImprovementPercentageArray = [];
    const ventilationImprovementPercentageArray = [];

    // Extract values from the JSON object
    jsonData = JSON.parse(jsonData);
    const rooms = findJsonField("rooms", jsonData);
    rooms.data.forEach((room) => {
        // Inside each room, search for the values we want to extract
        daylightScoreArray.push(findJsonField("daylightScore", room.attributes));
        airRenewalTimeArray.push(findJsonField("airRenewalTime", room.attributes));
        ventilationScoreArray.push(findJsonField("ventilationScore", room.attributes));
        daylightImprovementPercentageArray.push(findJsonField("daylightImprovementPercentage", room.attributes));
        ventilationImprovementPercentageArray.push(findJsonField("ventilationImprovementPercentage", room.attributes));
    });

    // Create arrays with names based on their contents
    const arrays = {
        daylightScoreArray,
        airRenewalTimeArray,
        ventilationScoreArray,
        daylightImprovementPercentageArray,
        ventilationImprovementPercentageArray,
    };

    // Print the arrays
    console.log("Data received from server:");
    for (const name in arrays) {
        console.log(`${name}: ${arrays[name]}`);
    }
}

function findJsonField(searchField, JSON) {
    for (const field in JSON) {
        if (field === searchField) {
            return JSON[field];
        }
        if (typeof JSON[field] === "object") {
            const result = findJsonField(searchField, JSON[field]);
            if (result !== null) {
                return result;
            }
        }
    }
    return null;
}
