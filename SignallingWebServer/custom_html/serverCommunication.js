import { Room, Project } from "./dataModels.js";

export async function getProjectData(projectID) {
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
    return fetch(`https://vds-cms.vrtxlabs.cloud/api/projects/${projectID}/?populate[0]=rooms`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            return parseProjectData(result, projectID);
        })
        .catch((error) => console.log("error", error));
}

function parseProjectData(jsonData, projectID) {
    if (jsonData === null || jsonData === undefined) {
        console.error("No data received");
        return;
    }

    // Extract values from the JSON object
    jsonData = JSON.parse(jsonData);
    const roomsArray = [];
    const rooms = findJsonField("rooms", jsonData);

    // Fill the room data, creating a room object for each room
    rooms.data.forEach((room) => {
        roomsArray.push(
            new Room(
                findJsonField("daylightScore", room.attributes),
                findJsonField("ventilationScore", room.attributes),
                findJsonField("daylightImprovementPercentage", room.attributes),
                findJsonField("ventilationImprovementPercentage", room.attributes),
                findJsonField("airRenewalTime", room.attributes)
            )
        );
    });

    // Create a new project object
    let project = new Project(projectID, jsonData.data.attributes.name, roomsArray);
    console.log("Data received from the server:");
    console.log(project);

    // Return the extracted data in the form of a project object
    return project;
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
