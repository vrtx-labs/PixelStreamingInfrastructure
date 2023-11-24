import { Room, Project } from "./dataModels.js";

export async function getProjectData(projectID, roomID) {
    if (projectID === null || projectID === undefined) {
        throw new Error("Project ID is not defined. Try adding &project_id= to the URL and supply an ID.");
    }

    var requestOptions = {
        method: "GET",
        headers: new Headers(),
    };

    // Return a promise that resolves to the room data
    let url = `https://vds-cms.vrtxlabs.cloud/api/projects/${projectID}?room_id=${roomID}`;
    return fetch(url, requestOptions)
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
    console.log("Data received from server:");
    console.log(jsonData);

    // We only share one room at a time via the first slot of the room array.
    // The Backend middleware will write the room data matching the requested id
    // in this slot.
    const roomsArray = [];
    const room = findJsonField("rooms", jsonData)[0];
    let climateData = room?.climate_data;

    if (climateData === null || climateData === undefined) {
        console.error("No climate data found");
        return new Project(projectID, findJsonField("name", jsonData), null);
    }

    if ((room !== null && room !== undefined) || (climateData !== null && climateData !== undefined)) {
        // Fill the room data of the first room
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

        console.log(room.room_variants.length.toString());

        // Fill the room data, creating a room object for each room
        room.room_variants.forEach((variant) => {
            climateData = variant?.climate_data;
            if (climateData === null || climateData === undefined) {
                roomsArray.push(room.name, 0, 0, 0, 0, 0);
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
    }

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
