import { Room, Project } from "./dataModels.js";

export async function getProjectData(projectID, roomID) {
    if (roomID === null || roomID === undefined || roomID === "") {
        throw new Error("Room ID has not been set. Try adding &room_id= to the URL and supply a room ID.");
    }

    // Read config file at ../config.json and extract the "CmsUrl" parameter
    const response = await fetch(`../config.json`);
    const config = await response.json();

    var requestOptions = {
        method: "GET",
        headers: new Headers(),
    };

    // Set the default domain and subdirectory to fetch the data from
    const defaultDomain = `https://vds-cms.vrtxlabs.cloud`;
    const urlSubdirectory = `/api/projects/${projectID}?room_id=${roomID}`;

    // Compose the url
    let domain = config.CmsUrl || defaultDomain;
    domain = domain.replace(/\/$/, "");

    const url = domain + urlSubdirectory;
    console.log(`Fetching data from ${url}`);

    // Return a promise that resolves to the room data

    return fetch(url, requestOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Project was not found. HTTP error status = " + response.status);
            }
            return response.text();
        })
        .then((result) => {
            return parseProjectData(result, projectID);
        })
        .catch((error) => {
            console.error(error);
            console.log("Returning default project data");
            return new Project(projectID, "Project Not Found", []);
        });
}

function parseProjectData(jsonData, projectID) {
    if (jsonData === null || jsonData === undefined) {
        // Throw new error
        throw new Error("No data received");
    }

    // Extract values from the JSON object
    jsonData = JSON.parse(jsonData);
    //console.log("Data received from server:");
    //console.log(jsonData);

    // We only share one room at a time via the first slot of the room array.
    // The Backend middleware will write the room data matching the requested id
    // in this slot.
    const roomsArray = [];
    const room = readJsonField("rooms", jsonData)[0];
    if (room === null || room === undefined) {
        throw new Error("No room data received for this project.");
    }

    // Start extracting climate data
    let climateData = room?.climate_data;
    if (room !== null && room !== undefined) {
        // Extract the climate data from the first room object
        if (climateData !== null && climateData !== undefined) {
            // Push the climate data to the rooms array
            roomsArray.push(
                new Room(
                    room.name,
                    climateData.room.daylight.daylight_Quantity_Score,
                    climateData.room.ventilation.ventilation_Score,
                    climateData.room.ventilation.ventilation_Time
                )
            );
        }

        // Fill the room data, creating a room object for each room
        room.room_variants.forEach((variant) => {
            climateData = variant?.climate_data;
            if (climateData === null || climateData === undefined) {
                console.warn("No climate data found for room variant.");
                roomsArray.push(new Room(variant.name, null, null, null));
            } else {
                roomsArray.push(
                    new Room(
                        variant.name,
                        climateData.room.daylight.daylight_Quantity_Score,
                        climateData.room.ventilation.ventilation_Score,
                        climateData.room.ventilation.ventilation_Time
                    )
                );
            }
        });
    }

    // Create a new project object
    let project = new Project(projectID, readJsonField("name", jsonData), roomsArray);
    console.log("Extracted project data:");
    console.log(project);

    // Return the extracted data in the form of a project object
    return project;
}

function readJsonField(searchField, JSON) {
    for (const field in JSON) {
        if (field === searchField) {
            return JSON[field];
        }
        if (typeof JSON[field] === "object") {
            const result = readJsonField(searchField, JSON[field]);
            if (result !== null) {
                return result;
            }
        }
    }
    return null;
}