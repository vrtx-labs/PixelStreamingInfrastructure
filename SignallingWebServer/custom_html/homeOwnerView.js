import * as references from "./references.js";
import { setupJoystick } from "./joystick.js";
import { CommunicationKeys, sendToStreamer, setupStreamerCommunication } from "./streamerCommunication.js";
import "./global.js";

// Constants
//const localStoragePrefix = "velux.";

// Enumn
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

// Variables
const LocalVariables = {
    menuActive: false,
    projectName: "Default Project",
    daylightScores: [0, 0, 0, 0],
    ventilationScores: [0, 0, 0, 0],
    ventilationRenewalTimes: [0, 0, 0, 0],
    daylightTextsGood: [
        "Good level of daylight",
        "There is an adequate amount of daylight in the room, which makes the room optimal for all activities.",
    ],
    daylightTextsMedium: ["Medium level of daylight", "The amount of daylight in the room can be improved."],
    daylightTextsBad: [
        "Bad level of daylight",
        "There is an inadequate amount of daylight in the room, which makes the room suboptimal for all activities.",
    ],
    ventilationTextsGood: [
        "Good level of ventilation",
        "The room is well ventilated, which makes the room optimal for all activities.",
    ],
    ventilationTextsMedium: ["Medium level of ventilation", "The amount of fresh air in the room can be improved."],
    ventilationTextsBad: [
        "Bad level of ventilation",
        "The room is poorly ventilated, which makes the room suboptimal for all activities.",
    ],
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
        // Hide the menu by removing the fade-in class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "fade-in",
            false
        );

        // And adding the fade-out class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "fade-out",
            true,
            true // Hide after animation
        );

        // Show menuButtonImage and toggle text
        references.domElements["toggleMenuButtonText"].classList.remove("fade-out");
        references.domElements["toggleMenuButtonText"].classList.add("expandAndFade");
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "fade-in",
            true
        );
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "fade-out",
            false
        );

        //
        //references.domElements["collapseMenuImage"].style.position = "absolute";
    } else {
        LocalVariables.menuActive = true;
        // Show the menu by adding the fade-in class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "fade-in",
            true
        );

        // And removing the fade-out class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
                references.domElements["collapseMenuImage"],
            ],
            "fade-out",
            false
        );

        // Hide menuButtonImage and toggle text^
        references.domElements["containerButtonToggleMenu"].classList.add("fade-trough");
        references.domElements["toggleMenuButtonText"].classList.add("fade-out");
        references.domElements["toggleMenuButtonText"].classList.remove("expandAndFade");
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "fade-in",
            false
        );
        setClassActive(
            [references.domElements["menuButtonImage"], references.domElements["toggleMenuButtonText"]],
            "fade-out",
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
    UpdateScoreTexts(true, roomNumber);
    UpdateScoreTexts(false, roomNumber);

    // Update ventilation renewal times

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
function UpdateScoreTexts(updateDaylightTexts, roomNumber) {
    // Score type
    let headerElement = references.domElements["daylightHeadingClimate"];
    let textElement = references.domElements["daylightTextClimate"];
    if (!updateDaylightTexts) {
        headerElement = references.domElements["ventilationHeadingClimate"];
        textElement = references.domElements["ventilationTextClimate"];
    }

    // Score level
    let scoreRating = "medium";
    if (LocalVariables.daylightScores[roomNumber - 1] > 4) scoreRating = "good";
    else if (LocalVariables.daylightScores[roomNumber - 1] < 2.5) scoreRating = "bad";

    // Find the correct texts
    let scoreHeading = "";
    let scoreText = "";
    switch (scoreRating) {
        case "good":
            scoreHeading = LocalVariables.daylightTextsGood[0];
            scoreText = LocalVariables.daylightTextsGood[1];
            if (!updateDaylightTexts) {
                scoreHeading = LocalVariables.ventilationTextsGood[0];
                scoreText = LocalVariables.ventilationTextsGood[1];
            }
            break;
        case "medium":
            scoreHeading = LocalVariables.daylightTextsMedium[0];
            scoreText = LocalVariables.daylightTextsMedium[1];
            if (!updateDaylightTexts) {
                scoreHeading = LocalVariables.ventilationTextsMedium[0];
                scoreText = LocalVariables.ventilationTextsMedium[1];
            }
            break;
        case "bad":
            scoreHeading = LocalVariables.daylightTextsBad[0];
            scoreText = LocalVariables.daylightTextsBad[1];
            if (!updateDaylightTexts) {
                scoreHeading = LocalVariables.ventilationTextsBad[0];
                scoreText = LocalVariables.ventilationTextsBad[1];
            }
            break;
        default:
            break;
    }

    // Set the texts
    headerElement.innerHTML = scoreHeading;
    textElement.innerHTML = scoreText;
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
        references.domElements["overlayClimateScores"].classList.remove("hiddenState");
    });
    references.domElements["closeClimateScores"].addEventListener("click", function onOverlayClick(event) {
        references.domElements["overlayClimateScores"].classList.add("hiddenState");
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
