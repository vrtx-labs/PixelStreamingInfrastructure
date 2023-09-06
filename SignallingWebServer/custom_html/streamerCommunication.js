// Constants
export const CommunicationKeys = {
    projectIDKey: "projectID",
    roomNameKey: "roomName",
    projectViewKey: "projectView",
    settingsProjectViewKey: "settingsProjectView",
    roomOptionKey: "roomOption",
    daylightSliderKey: "daylightSliderValue",
    screenshotKey: "screenshot",
    mouseControlSchemeKey: "hoveringMouse",
    joystickValuesKey: "joystickValues",
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

    console.log(`Received response message from streamer: "${response}"`);
}
