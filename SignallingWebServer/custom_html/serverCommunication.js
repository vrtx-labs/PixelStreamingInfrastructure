import { Room } from "./dataModels.js";

export async function getRoomData(projectID) {
    var myHeaders = new Headers();
    myHeaders.append(
        "Authorization",
        "bearer " // Insert API Token here
    );

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
    };

    // Return a promise that resolves to the room data
    return fetch("https://vds-cms.vrtxlabs.cloud/api/projects/10/?populate[0]=rooms", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            return parseResponse(result, projectID);
        })
        .catch((error) => console.log("error", error));
}

function parseResponse(jsonData) {
    if (jsonData === null || jsonData === undefined) {
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

    // Create a new Room object for each room
    const roomsArray = [];
    for (let i = 0; i < rooms.data.length; i++) {
        roomsArray.push(
            new Room(
                daylightScoreArray[i],
                ventilationScoreArray[i],
                daylightImprovementPercentageArray[i],
                ventilationImprovementPercentageArray[i],
                airRenewalTimeArray[i]
            )
        );
    }

    // return a new promise
    return roomsArray;
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
