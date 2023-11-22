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

export function sendHandshakeToStreamer(isDesignAdvisor, projectID, roomID) {
    let descriptor = {
        handshake: {
            isDesignAdvisor: isDesignAdvisor,
            [CommunicationKeys.projectIDKey]: projectID,
            [CommunicationKeys.roomIDKey]: roomID,
        },
    };
    emitUIInteraction(descriptor);
    console.log(`Initiating handshake with streamer: ${JSON.stringify(descriptor)}`);
}

function receiveFromStreamer(response) {
    // Trigger event on window
    let event = new CustomEvent("streamer_response", {
        detail: response,
    });
    window.dispatchEvent(event);
}
