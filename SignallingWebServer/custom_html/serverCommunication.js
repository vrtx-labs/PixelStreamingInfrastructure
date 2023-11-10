import { Room, Project } from "./dataModels.js";

export async function getProjectData(projectID) {
    if (projectID === null || projectID === undefined) {
        throw new Error("Project ID is not defined. Try adding &project_id= to the URL and supply an ID.");
    }

    var requestOptions = {
        method: "GET",
        headers: new Headers(),
    };

    // Return a promise that resolves to the room data
    return fetch(`https://vds-cms.vrtxlabs.cloud/api/projects/${projectID}`, requestOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status + " " + response.statusText);
            }
            return response.text();
        })
        .then((result) => {
            return parseProjectData(result, projectID);
        })
        .catch((error) => {
            throw new Error(error);
        });
}

function parseProjectData(jsonData, projectID) {
    if (jsonData === null || jsonData === undefined) {
        // Throw new error
        throw new Error("No data received");
    }

    // Extract values from the JSON object
    jsonData = JSON.parse(jsonData);
    const roomsArray = [];
    const rooms = findJsonField("rooms", jsonData);

    // Fill the room data, creating a room object for each room
    rooms.forEach((room) => {
        let climateData = room.climate_data;
        if (climateData === null || climateData === undefined) {
            roomsArray.push(room.name ?? "", 0, 0, 0, 0, 0);
            return;
        }

        roomsArray.push(
            new Room(
                room.name,
                climateData.daylightScore,
                climateData.ventilationScore,
                climateData.daylightImprovementPercentage,
                climateData.ventilationImprovementPercentage,
                climateData.airRenewalTime
            )
        );
    });

    // Create a new project object
    let project = new Project(projectID, findJsonField("name", jsonData), roomsArray);
    console.log("Data received from server:");
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