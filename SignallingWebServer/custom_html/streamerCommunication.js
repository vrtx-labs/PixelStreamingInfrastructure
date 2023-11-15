// Constants
export const CommunicationKeys = {
    projectIDKey: "project_id",
    roomIDKey: "room_id",
    activeRoomKey: "activeRoom",
    projectViewKey: "projectView",
    settingsProjectViewKey: "settingsProjectView",
    roomOptionKey: "roomOption",
    daylightSliderKey: "daylightSliderValue",
    screenshotKey: "screenshot",
    refreshKey: "refresh",
    mouseControlSchemeKey: "hoveringMouse",
    joystickValuesKey: "joystickValues",
    roomNamesKey: "roomNames",
    daylightScoresKey: "daylightScores",
    ventilationScoresKey: "ventilationScores",
};

export function setupStreamerCommunication() {
    addResponseEventListener("handle_responses", receiveFromStreamer);
}

export function sendToStreamer(key, value) {
    let descriptor = {
        [key]: value,
    };
    emitUIInteraction(descriptor);
    console.log(`Message to streamer: ${JSON.stringify(descriptor)}`);
}

function receiveFromStreamer(response) {
    // trigger event on window
    let event = new CustomEvent("streamer_response", {
        detail: response,
    });
    window.dispatchEvent(event);
}
