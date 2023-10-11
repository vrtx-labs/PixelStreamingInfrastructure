import * as references from "./references.js";
import { setupJoystick } from "./joystick.js";
import { CommunicationKeys, sendToStreamer, setupStreamerCommunication } from "./streamerCommunication.js";
import "./global.js";

// Constants
//const localStoragePrefix = "velux.";

// Enumns
class MenuContent {
    static Help = new MenuContent("Help");
    static RoomOptions = new MenuContent("RoomOptions");
    static DaylightSlider = new MenuContent("DaylightSlider");

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `menuContent.${this.name}`;
    }
}
class ScoreType {
    static Daylight = new ScoreType("Daylight");
    static Ventilation = new ScoreType("Ventilation");
    static VentilationRenewalTimes = new ScoreType("VentilationRenewalTimes");

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `scoreType.${this.name}`;
    }
}

// Variables
const LocalVariables = {
    menuActive: false,
    projectName: "Default Project",
    daylightScores: [0, 0, 0, 0],
    ventilationScores: [0, 0, 0, 0],
    daylightPercentages: [0, 0, 0, 0],
    ventilationPercentages: [0, 0, 0, 0],
    ventilationRenewalTimes: [0, 0, 0, 0],
    daylightTextsGood: [
        "Good level of daylight",
        "There is an adequate amount of daylight in the room, which makes the room optimal for all activities.",
    ],
    daylightTextsMedium: ["Medium level of daylight", "The amount of daylight in the room can be improved."],
    daylightTextsLow: [
        "Low level of daylight",
        "There is an inadequate amount of daylight in the room, which makes the room suboptimal for all activities.",
    ],
    ventilationTextsGood: [
        "Good level of ventilation",
        "The room is well ventilated, which makes the room optimal for all activities.",
    ],
    ventilationTextsMedium: ["Medium level of ventilation", "The amount of fresh air in the room can be improved."],
    ventilationTextsLow: [
        "Low level of ventilation",
        "The room is poorly ventilated, which makes the room suboptimal for all activities.",
    ],
    daylightPercentageTextLower: "Less light than in your current room",
    daylightPercentageTextHigher: "More light than in your current room",
    daylightPercentageTextEqual: "Same as in your current room",
    ventilationPercentageTextLower: "Slower to change air in your room",
    ventilationPercentageTextHigher: "Faster to change air in your room",
    ventilationPercentageTextEqual: "Same as in your current room",
    airRenewalTime: "Air renewal time is up to",
};

// Setup: The event is linked to app.js OnLoadFinished in the setup function
window.addEventListener("OnLoadFinished", () => {
    setup();
});

function setup() {
    references.getDOMElements();
    setupUIElements();
    setupCommunication();
    activateDefaultSettings();
    setTimeout(function () {
        scrollToTop();
    }, 50);
}

function setupUIElements() {
    setupPlayButton();
    setupScreenshotButton();
    setupShareButton();
    setupMenuContentButtons();
    setupToggleMenuButton();
    setupRoomButtons();
    setupSlider();
    setupJoystick();
    setupClimateDrawer();

    // Update UI state
    setActiveRoom();
    setBreadcrumbs(references.getRoomElementsByNumber(1)[0].innerHTML, LocalVariables.projectName);
}

function getURLParameter(parameter) {
    const parsedUrl = new URL(window.location.href);
    const projectID = parsedUrl.searchParams.has(parameter) ? parsedUrl.searchParams.get(parameter) : null;

    return projectID;
}

function scrollToTop() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
    });
    setTimeout(function () {
        document.body.classList.add("stop-scrolling");
    }, 50);
}

function setupPlayButton() {
    references.domElements["videoPlayOverlay"].addEventListener("click", function onOverlayClick(event) {
        startStream();
    });
}

function startStream() {
    // Wait for the connection to establish - ToDo: React to a proper event or let the Unreal Application send one
    setTimeout(function () {
        // Read html attribute 'ProjectID'
        const projectID = getURLParameter(CommunicationKeys.projectIDKey);
        console.log(`projectID: ${projectID}`);
        if (projectID !== null) {
            sendToStreamer(CommunicationKeys.projectIDKey, projectID);
        }
    }, 350);
}

function setupCommunication() {
    setupStreamerCommunication();

    // subscribe to "streamer_response" event on window
    window.addEventListener("streamer_response", function (event) {
        const incomingObject = JSON.parse(event.detail);

        // switch case for all possible incoming messages:
        switch (Object.keys(incomingObject)[0]) {
            case CommunicationKeys.projectIDKey:
                // Set the project name
                LocalVariables.projectName = incomingObject[CommunicationKeys.projectIDKey];
                setBreadcrumbs(references.getRoomElementsByNumber(1)[0].innerHTML, LocalVariables.projectName);
                break;
            case CommunicationKeys.roomNamesKey:
                // Set the room names
                setRoomName(1, incomingObject[CommunicationKeys.roomNamesKey]["1"]);
                setRoomName(2, incomingObject[CommunicationKeys.roomNamesKey]["2"]);
                setRoomName(3, incomingObject[CommunicationKeys.roomNamesKey]["3"]);
                setRoomName(4, incomingObject[CommunicationKeys.roomNamesKey]["4"]);

                // Activate the first room
                setActiveRoom();
                break;
            case CommunicationKeys.daylightScoresKey:
                // Set the daylight scores
                LocalVariables.daylightScores[0] = parseFloat(incomingObject[CommunicationKeys.daylightScoresKey]["1"]);
                LocalVariables.daylightScores[1] = parseFloat(incomingObject[CommunicationKeys.daylightScoresKey]["2"]);
                LocalVariables.daylightScores[2] = parseFloat(incomingObject[CommunicationKeys.daylightScoresKey]["3"]);
                LocalVariables.daylightScores[3] = parseFloat(incomingObject[CommunicationKeys.daylightScoresKey]["4"]);
                break;
            case CommunicationKeys.ventilationScoresKey:
                // Set the ventilation scores
                LocalVariables.ventilationScores[0] = parseFloat(incomingObject[CommunicationKeys.ventilationScoresKey]["1"]);
                LocalVariables.ventilationScores[1] = parseFloat(incomingObject[CommunicationKeys.ventilationScoresKey]["2"]);
                LocalVariables.ventilationScores[2] = parseFloat(incomingObject[CommunicationKeys.ventilationScoresKey]["3"]);
                LocalVariables.ventilationScores[3] = parseFloat(incomingObject[CommunicationKeys.ventilationScoresKey]["4"]);

                // Update the daylight and ventilation scores
                setActiveRoom();
                break;
            default:
                break;
        }
    });
}

function setBreadcrumbs(room, project = "") {
    if (project === "" || project === undefined) project = LocalVariables.projectName;

    references.domElements["breadcrumbs"].innerHTML = project + " / " + room;
}

function setRoomName(roomNumber, name) {
    // Get room references
    references.getRoomElementsByNumber(roomNumber).forEach((room) => {
        // Check the name string for whitespace
        if (name === undefined || name === null || name.trim() === "") room.classList.add("hiddenState");
        room.innerHTML = name;
    });
}

function setupToggleMenuButton() {
    references.domElements["containerButtonToggleMenu"].addEventListener("click", function onOverlayClick(event) {
        toggleMenu();
    });
}

function setupScreenshotButton() {
    references.domElements["buttonScreenshot"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.screenshotKey, "true");
    });
}

function setupShareButton() {
    references.domElements["buttonShare"].addEventListener("click", function onOverlayClick(event) {
        // Copy current url to clipboard
        if (!Boolean(navigator.clipboard)) {
            console.warn("Clipboard API not available");
            return;
        }
        navigator.clipboard.writeText(window.location.href).then(
            function () {
                console.log("Copying to clipboard was successful!");
            },
            function (err) {
                console.error("Could not copy text: ", err);
            }
        );
    });
}

function toggleMenu() {
    if (LocalVariables.menuActive) {
        LocalVariables.menuActive = false;
        // Hide the menu by removing the menu-in class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "menu-in",
            false
        );

        // And adding the menu-out class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "menu-out",
            true,
            true // Hide after animation
        );

        // Show menuButtonImage and toggle text
        references.domElements["toggleMenuButtonText"].classList.remove("menu-out");
        references.domElements["toggleMenuButtonText"].classList.add("expandAndFade");
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "menu-in",
            true
        );
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "menu-out",
            false
        );

        //
        //references.domElements["collapseMenuImage"].style.position = "absolute";
    } else {
        LocalVariables.menuActive = true;
        // Show the menu by adding the menu-in class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "menu-in",
            true
        );

        // And removing the menu-out class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "menu-out",
            false
        );

        // Hide menuButtonImage and toggle text^
        references.domElements["containerButtonToggleMenu"].classList.add("fade-trough");
        references.domElements["toggleMenuButtonText"].classList.add("menu-out");
        references.domElements["toggleMenuButtonText"].classList.remove("expandAndFade");
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "menu-in",
            false
        );
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "menu-out",
            true,
            true
        ); // ToDo: This line is only necessary for hiding after animation

        //
        //references.domElements["collapseMenuImage"].style.position = "absolute";
        //references.domElements["collapseMenuImage"].addEventListener(
        //    "animationend",
        //    () => {
        //        references.domElements["collapseMenuImage"].style.position = "relative";
        //    },
        //    { once: true }
        //);
    }
}

function setClassActive(listOfElements, className, setActive, hideAfterAnimation = false) {
    for (let i = 0; i < listOfElements.length; i++) {
        if (setActive) {
            listOfElements[i].classList.remove("hiddenState");
            listOfElements[i].classList.add(className);
            // on animation end, add the hiddenState class
            if (hideAfterAnimation)
                listOfElements[i].addEventListener(
                    "animationend",
                    () => {
                        listOfElements[i].classList.add("hiddenState");
                    },
                    { once: true }
                );
        } else {
            listOfElements[i].classList.remove(className);
        }
    }
}

function setupMenuContentButtons() {
    references.domElements["buttonRoomOptions"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.RoomOptions);
    });
    references.domElements["buttonDaylight"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.DaylightSlider);
    });
}

function showMenuContent(menuContent) {
    // Check menuContent type
    if (!(menuContent instanceof MenuContent)) return;

    // Disable all elements
    references.domElements["menuContentRoomOptions"].classList.add("hiddenState");
    references.domElements["menuContentDaylightSlider"].classList.add("hiddenState");

    // Switch the menu content in a switch case statement
    switch (menuContent) {
        case MenuContent.Help:
            references.domElements["menuContentHelp"].classList.remove("hiddenState");
            break;
        case MenuContent.RoomOptions: // Room Options and Daylight Slider are mutually exclusive
            references.domElements["menuContentRoomOptions"].classList.remove("hiddenState");
            references.domElements["containerButtonRoomOptions"].classList.add("hiddenState");
            references.domElements["containerButtonDaylight"].classList.remove("hiddenState");
            break;
        case MenuContent.DaylightSlider:
            references.domElements["menuContentDaylightSlider"].classList.remove("hiddenState");
            references.domElements["containerButtonDaylight"].classList.add("hiddenState");
            references.domElements["containerButtonRoomOptions"].classList.remove("hiddenState");
            break;
        default:
            break;
    }
}

function setupRoomButtons() {
    references.getRoomElementsByNumber(1).forEach((element) => {
        element.addEventListener("click", function onOverlayClick(event) {
            setActiveRoom(1);
        });
    });
    references.getRoomElementsByNumber(2).forEach((element) => {
        element.addEventListener("click", function onOverlayClick(event) {
            setActiveRoom(2);
        });
    });
    references.getRoomElementsByNumber(3).forEach((element) => {
        element.addEventListener("click", function onOverlayClick(event) {
            setActiveRoom(3);
        });
    });
    references.getRoomElementsByNumber(4).forEach((element) => {
        element.addEventListener("click", function onOverlayClick(event) {
            setActiveRoom(4);
        });
    });
}

function setActiveRoom(roomNumber = 1) {
    // Unmark all, then mark the selected room
    references.getAllRoomElements().forEach((button) => {
        button.classList.remove("selected-room");
    });
    references.getRoomElementsByNumber(roomNumber).forEach((button) => {
        if (button !== undefined && button.classList !== undefined) button.classList.add("selected-room");
    });

    // Update the breadcrumbs in the top-left corner
    setBreadcrumbs(references.getRoomElementsByNumber(roomNumber)[0].innerHTML);

    // Update the daylight and ventilation scores
    references.getDaylightScores().forEach((score) => {
        score.innerHTML = LocalVariables.daylightScores[roomNumber - 1].toFixed(1);
    });
    references.getVentilationScores().forEach((score) => {
        score.innerHTML = LocalVariables.ventilationScores[roomNumber - 1].toFixed(1);
    });

    // Update the daylight and ventilation texts
    UpdateScoreTexts(ScoreType.Daylight, roomNumber);
    UpdateScoreTexts(ScoreType.Ventilation, roomNumber);

    // Update percentage values & ventilation renewal times
    updateScoreMetrics(ScoreType.Daylight, roomNumber);
    updateScoreMetrics(ScoreType.Ventilation, roomNumber);
    updateScoreMetrics(ScoreType.VentilationRenewalTimes, roomNumber);

    // Compute and set improvement percentages for ventilation and daylight in respect to room 1
    let ventilationImprovement = 0;
    let daylightImprovement = 0;
    if (roomNumber !== 1) {
        ventilationImprovement =
            (LocalVariables.ventilationScores[roomNumber - 1] / LocalVariables.ventilationScores[0]) * 100 - 100;
        daylightImprovement = (LocalVariables.daylightScores[roomNumber - 1] / LocalVariables.daylightScores[0]) * 100 - 100;
    }

    // Send to streamer
    sendToStreamer(CommunicationKeys.activeRoomKey, roomNumber);
}

// Updates either daylight or ventilation texts corresponding to the room number
function UpdateScoreTexts(scoreType, roomNumber) {
    if (!(scoreType instanceof ScoreType)) return;

    // Score type
    let headerElement = references.domElements["daylightHeadingClimate"];
    let textElement = references.domElements["daylightTextClimate"];
    if (scoreType == ScoreType.Ventilation) {
        headerElement = references.domElements["ventilationHeadingClimate"];
        textElement = references.domElements["ventilationTextClimate"];
    }

    // Score level
    let scoreRating = "medium";
    if (LocalVariables.daylightScores[roomNumber - 1] > 4) scoreRating = "good";
    else if (LocalVariables.daylightScores[roomNumber - 1] < 2.5) scoreRating = "low";

    // Find the correct texts
    let scoreHeading = "";
    let scoreText = "";
    switch (scoreRating) {
        case "good":
            scoreHeading = LocalVariables.daylightTextsGood[0];
            scoreText = LocalVariables.daylightTextsGood[1];
            if (scoreType == ScoreType.Ventilation) {
                scoreHeading = LocalVariables.ventilationTextsGood[0];
                scoreText = LocalVariables.ventilationTextsGood[1];
            }
            break;
        case "medium":
            scoreHeading = LocalVariables.daylightTextsMedium[0];
            scoreText = LocalVariables.daylightTextsMedium[1];
            if (scoreType == ScoreType.Ventilation) {
                scoreHeading = LocalVariables.ventilationTextsMedium[0];
                scoreText = LocalVariables.ventilationTextsMedium[1];
            }
            break;
        case "low":
            scoreHeading = LocalVariables.daylightTextsLow[0];
            scoreText = LocalVariables.daylightTextsLow[1];
            if (scoreType == ScoreType.Ventilation) {
                scoreHeading = LocalVariables.ventilationTextsLow[0];
                scoreText = LocalVariables.ventilationTextsLow[1];
            }
            break;
        default:
            break;
    }

    // Set the texts
    headerElement.innerHTML = scoreHeading;
    textElement.innerHTML = scoreText;
}

function updateScoreMetrics(scoreType, roomNumber) {
    if (!(scoreType instanceof ScoreType)) return;

    // Set the percentage value
    let value = LocalVariables.daylightPercentages[roomNumber - 1];
    let isHigher = value > LocalVariables.daylightPercentages[0];
    let isLower = value < LocalVariables.daylightPercentages[0];

    // Set the the references (text & value)
    let valueElement = references.domElements["daylightPercentageClimate"];
    let textElement = references.domElements["daylightPercentageTextClimate"];

    // Set the results
    let textEqual = LocalVariables.daylightPercentageTextEqual;
    let textHigher = LocalVariables.daylightPercentageTextHigher;
    let textLower = LocalVariables.daylightPercentageTextLower;

    // Overwrite the references, if necessary
    if (scoreType == ScoreType.Daylight) {
        // In case of upating the daylight values, the references are already set
        // So we only need to update the icon
        updateArrowImage(references.domElements["daylightArrowImages"], isHigher);
    } else if (scoreType == ScoreType.Ventilation) {
        // Ventilation: Re-calculate the values
        value = LocalVariables.ventilationPercentages[roomNumber - 1];
        isHigher = value > LocalVariables.ventilationPercentages[0];
        isLower = value < LocalVariables.ventilationPercentages[0];

        // Set the references
        valueElement = references.domElements["ventilationPercentageClimate"];
        textElement = references.domElements["ventilationPercentageTextClimate"];

        // Set the results
        textEqual = LocalVariables.ventilationPercentageTextEqual;
        textHigher = LocalVariables.ventilationPercentageTextHigher;
        textLower = LocalVariables.ventilationPercentageTextLower;

        // Update the icon
        updateArrowImage(references.domElements["ventilationArrowImages"], isHigher);
    } else if (scoreType == ScoreType.VentilationRenewalTimes) {
        // VentilationRenewalTimes: Re-calculate the values
        value = LocalVariables.ventilationRenewalTimes[roomNumber - 1];
        isHigher = value > LocalVariables.ventilationRenewalTimes[0];
        isLower = value < LocalVariables.ventilationRenewalTimes[0];

        // Set the references
        valueElement = references.domElements["ventilationMinutesClimate"];
        textElement = references.domElements["ventilationMinutesTextClimate"];

        // The result is not dependent on the percentage value
        textEqual = textHigher = textLower = LocalVariables.airRenewalTime + " " + value + " minutes";

        // Update the icon
        updateArrowImage(references.domElements["ventilationMinutesArrowImages"], isHigher);
    }

    // Set the percentage value and the text
    valueElement.innerHTML = value + "%";
    if (scoreType == ScoreType.VentilationRenewalTimes) valueElement.innerHTML = value + " min";
    textElement.innerHTML = textEqual;
    if (isHigher) textElement.innerHTML = textHigher;
    else if (isLower) textElement.innerHTML = textLower;
}

function updateArrowImage(imageList, up) {
    if (imageList === undefined || imageList === null || imageList.length !== 2) return;
    if (up) {
        imageList[0].classList.remove("hiddenState");
        imageList[1].classList.add("hiddenState");
    } else {
        imageList[0].classList.add("hiddenState");
        imageList[1].classList.remove("hiddenState");
    }
}

function setupSlider() {
    let slider = references.domElements["daylightSlider"];
    let sliderText = references.domElements["dayLightSliderText"];

    // Construct the text for the slider value and send the current value to the streamer
    let updateSlider = function (value) {
        let tod = new Date(0, 0, 0, 0, 0, 0, 0);
        tod.setTime(tod.getTime() + value * 60000); // Add slider value in milliseconds

        sliderText.innerHTML = tod.getHours() + ":" + tod.getMinutes().toString().padStart(2, "0");
        sendToStreamer(CommunicationKeys.daylightSliderKey, (value / 1440).toFixed(6));
    };

    // Update the current slider value each time the slider handle is dragged
    slider.oninput = function () {
        updateSlider(this.value);
    };

    // Update the slider value at start
    updateSlider(slider.value); // ToDo: Do this after establishing Unreal connection
}

function setupClimateDrawer() {
    references.domElements["buttonReadMoreClimateScores"].addEventListener("click", function onOverlayClick(event) {
        // Fade in the overlay and make it block clicks
        references.domElements["overlayClimateScores"].classList.remove("no-pointer");
        references.domElements["overlayClimateScores"].classList.add("fade-in");

        // Move out the drawer
        references.domElements["drawerClimateScores"].classList.add("move-in");
    });
    references.domElements["closeClimateScores"].addEventListener("click", function onOverlayClick(event) {
        // Fade out the overlay and allow clicks to pass through
        references.domElements["overlayClimateScores"].classList.remove("fade-in");

        // On animation end, add hiddenState class
        references.domElements["overlayClimateScores"].addEventListener(
            "transitionend",
            () => {
                references.domElements["overlayClimateScores"].classList.add("no-pointer");
            },
            { once: true }
        );

        // Move in the drawer
        references.domElements["drawerClimateScores"].classList.remove("move-in");
    });
}

function activateDefaultSettings() {
    // Set match viewport resolution to true
    setRadioButtonState("match-viewport-res-tgl", true);

    // Set the control scheme to Hovering Mouse
    setRadioButtonState("control-tgl", true);

    // Hide the cursor
    setRadioButtonState("cursor-tgl", false);

    // Fake mouse with touches
    setFakeMouseWithTouches(true);
}

function setRadioButtonState(id, state) {
    let radioButton = document.getElementById(id);
    if (radioButton === null || radioButton.checked == state) return;

    // Manually change the state of the button
    radioButton.checked = state;

    // Create a new event and dispatch it
    let event = new Event("change", {});
    radioButton.dispatchEvent(event);
}
