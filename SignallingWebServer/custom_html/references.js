export const domElements = {}; // Holds references to DOM elements

export function getDOMElements() {
    // Rooms
    domElements["buttonRoom1"] = document.getElementById("buttonRoom1");
    domElements["buttonRoom2"] = document.getElementById("buttonRoom2");
    domElements["buttonRoom3"] = document.getElementById("buttonRoom3");
    domElements["buttonRoom4"] = document.getElementById("buttonRoom4");
    domElements["buttonRoom1Climate"] = document.getElementById("buttonRoom1Climate");
    domElements["buttonRoom2Climate"] = document.getElementById("buttonRoom2Climate");
    domElements["buttonRoom3Climate"] = document.getElementById("buttonRoom3Climate");
    domElements["buttonRoom4Climate"] = document.getElementById("buttonRoom4Climate");

    // Scores
    domElements["daylightScore"] = document.getElementById("daylightScore");
    domElements["daylightScoreClimate"] = document.getElementById("daylightScoreClimate");
    domElements["ventilationScore"] = document.getElementById("ventilationScore");
    domElements["ventilationScoreClimate"] = document.getElementById("ventilationScoreClimate");

    domElements["daylightHeadingClimate"] = document.getElementById("daylightHeadingClimate");
    domElements["daylightTextClimate"] = document.getElementById("daylightTextClimate");
    domElements["ventilationHeadingClimate"] = document.getElementById("ventilationHeadingClimate");
    domElements["ventilationTextClimate"] = document.getElementById("ventilationTextClimate");

    domElements["overlayClimateScores"] = document.getElementById("overlayClimateScores");
    domElements["drawerClimateScores"] = document.getElementById("drawerClimateScores");
    domElements["closeClimateScores"] = document.getElementById("closeClimateScores");
    domElements["buttonReadMoreClimateScores"] = document.getElementById("containerReadMore");

    domElements["daylightPercentageClimate"] = document.getElementById("daylightPercentageClimate");
    domElements["daylightPercentageTextClimate"] = document.getElementById("daylightPercentageTextClimate");
    domElements["ventilationPercentageClimate"] = document.getElementById("ventilationPercentageClimate");
    domElements["ventilationPercentageTextClimate"] = document.getElementById(
        "ventilationPercentageTextClimate"
    );
    domElements["ventilationMinutesClimate"] = document.getElementById("ventilationMinutesClimate");
    domElements["ventilationMinutesTextClimate"] = document.getElementById("ventilationMinutesTextClimate");

    domElements["daylightArrowImages"] = document
        .getElementById("containerDaylightArrowClimate")
        .getElementsByTagName("img");
    domElements["ventilationArrowImages"] = document
        .getElementById("containerVentilationArrowClimate")
        .getElementsByTagName("img");
    domElements["ventilationMinutesArrowImages"] = document
        .getElementById("containerVentilationMinutesArrowClimate")
        .getElementsByTagName("img");

    // Tools
    domElements["buttonScreenshot"] = document.getElementById("containerButtonScreenshot");
    domElements["buttonShare"] = document.getElementById("containerButtonShare");
    domElements["buttonHelp"] = document.getElementById("containerButtonHelp");
    domElements["buttonRefresh"] = document.getElementById("containerButtonRefresh");
    domElements["containerButtonToggleMenu"] = document.getElementById("containerButtonToggleMenu");
    domElements["menuContentHelp"] = document.getElementById("containerHelp");
    domElements["menuContentRoomOptions"] = document.getElementById("containerRoomOptions");
    domElements["menuContentDaylightSlider"] = document.getElementById("containerSliderDaylight");
    domElements["menuButtonImage"] = document.getElementById("menuButtonImage");
    domElements["collapseMenuImage"] = document.getElementById("collapseMenuImage");
    domElements["toggleMenuButtonText"] = document.getElementById("toggleMenuButtonText");

    // Misc
    domElements["videoPlayOverlay"] = document.getElementById("videoPlayOverlay");
    domElements["buttonRoomOptions"] = document.getElementById("containerButtonRoomOptions");
    domElements["buttonDaylight"] = document.getElementById("containerButtonDaylight");
    domElements["daylightSlider"] = document.getElementById("sliderDaylight");
    domElements["dayLightSliderText"] = document.getElementById("daylightValue");
    domElements["containerButtonDaylight"] = document.getElementById("containerButtonDaylight");
    domElements["containerButtonRoomOptions"] = document.getElementById("containerButtonRoomOptions");
    domElements["breadcrumbs"] = document.getElementById("breadcrumbs");
}

export function getRoomElementsByNumber(roomNumber) {
    switch (roomNumber) {
        case 1:
            return [domElements["buttonRoom1"], domElements["buttonRoom1Climate"]];
        case 2:
            return [domElements["buttonRoom2"], domElements["buttonRoom2Climate"]];
        case 3:
            return [domElements["buttonRoom3"], domElements["buttonRoom3Climate"]];
        case 4:
            return [domElements["buttonRoom4"], domElements["buttonRoom4Climate"]];
        default:
            return [domElements["buttonRoom1"], domElements["buttonRoom1Climate"]];
    }
}

export function getDaylightScores() {
    return [domElements["daylightScore"], domElements["daylightScoreClimate"]];
}

export function getVentilationScores() {
    return [domElements["ventilationScore"], domElements["ventilationScoreClimate"]];
}

export function getAllRoomElements() {
    return [
        domElements["buttonRoom1"],
        domElements["buttonRoom2"],
        domElements["buttonRoom3"],
        domElements["buttonRoom4"],
        domElements["buttonRoom1Climate"],
        domElements["buttonRoom2Climate"],
        domElements["buttonRoom3Climate"],
        domElements["buttonRoom4Climate"],
    ];
}
