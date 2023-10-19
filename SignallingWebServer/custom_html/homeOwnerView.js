import * as references from "./references.js";
import * as serverCommunication from "./serverCommunication.js";
import { MenuContent, ScoreType, Room, Project } from "./dataModels.js";
import { setupJoystick } from "./joystick.js";
import { CommunicationKeys, sendToStreamer, setupStreamerCommunication } from "./streamerCommunication.js";
import "./serverCommunication.js";
import "./global.js"; // ToDo: Find a better place for the code in here

// Constants
//const localStoragePrefix = "velux.";
const daylightTextsGood = [
    "Good level of daylight",
    "There is an adequate amount of daylight in the room, which makes the room optimal for all activities.",
];
const daylightTextsMedium = ["Medium level of daylight", "The amount of daylight in the room can be improved."];
const daylightTextsLow = [
    "Low level of daylight",
    "There is an inadequate amount of daylight in the room, which makes the room suboptimal for all activities.",
];
const ventilationTextsGood = [
    "Good level of ventilation",
    "The room is well ventilated, which makes the room optimal for all activities.",
];
const ventilationTextsMedium = [
    "Medium level of ventilation",
    "The amount of fresh air in the room can be improved.",
];
const ventilationTextsLow = [
    "Low level of ventilation",
    "The room is poorly ventilated, which makes the room suboptimal for all activities.",
];
const daylightPercentageTextLower = "Less light than in your current room";
const daylightPercentageTextHigher = "More light than in your current room";
const daylightPercentageTextEqual = "Same as in your current room";
const ventilationPercentageTextLower = "Slower to change air in your room";
const ventilationPercentageTextHigher = "Faster to change air in your room";
const ventilationPercentageTextEqual = "Same as in your current room";
const airRenewalTimeText = "Air renewal time is up to";

// Variables
const LocalVariables = {
    menuActive: false,
    projectName: "Default Project",
    roomData: [null, null, null, null],
};

// Setup: The event is linked to app.js OnLoadFinished in the setup function
window.addEventListener("OnLoadFinished", () => {
    setup();
});

async function setup() {
    // Request project data from the server. On Success, setup the frontend
    let projectID = getURLParameter(CommunicationKeys.projectIDKey);
    await serverCommunication
        .getProjectData(projectID)
        .then((project) => {
            // Set the room data after successfully fetching it, then continue with the setup
            LocalVariables.projectName = project.name;
            LocalVariables.roomData = project.rooms;
            setupFrontend();
        })
        .catch((error) => {
            // Handle any errors that occurred during the fetch request
            console.error(
                `An error occurred while fetching project data from the server. Showing mock-up data. Error: ${error}`
            );

            // fill room data with mock-up data
            LocalVariables.roomData = [null, null, null, null];
            for (let roomIndex = 0; roomIndex < LocalVariables.roomData.length; roomIndex++) {
                LocalVariables.roomData[roomIndex] = new Room(
                    roomIndex + 2,
                    roomIndex + 2,
                    roomIndex * 20,
                    25 * roomIndex,
                    8 - roomIndex * 2
                );
            }
            setupFrontend();
        });
}

function setupFrontend() {
    references.getDOMElements();
    setupUIElements();
    setupStreamerCommunication();
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
    const parsedUrl = new URL(document.location);
    const value = parsedUrl.searchParams.has(parameter) ? parsedUrl.searchParams.get(parameter) : null;

    return value;
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
    references.domElements["containerButtonToggleMenu"].addEventListener(
        "click",
        function onOverlayClick(event) {
            toggleMenu();
        }
    );
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
        score.innerHTML = LocalVariables.roomData[roomNumber - 1].daylightScore.toFixed(1);
    });
    references.getVentilationScores().forEach((score) => {
        score.innerHTML = LocalVariables.roomData[roomNumber - 1].ventilationScore.toFixed(1);
    });

    // Update the daylight and ventilation texts
    UpdateScoreTexts(ScoreType.Daylight, roomNumber);
    UpdateScoreTexts(ScoreType.Ventilation, roomNumber);

    // Update percentage values & ventilation renewal times
    updateScoreMetrics(ScoreType.Daylight, roomNumber);
    updateScoreMetrics(ScoreType.Ventilation, roomNumber);
    updateScoreMetrics(ScoreType.AirRenewalTimes, roomNumber);

    // Compute and set improvement percentages for ventilation and daylight in respect to room 1
    let ventilationImprovement = 0;
    let daylightImprovement = 0;
    if (roomNumber !== 1) {
        ventilationImprovement =
            (LocalVariables.roomData[roomNumber - 1].ventilationScore /
                LocalVariables.roomData[0].ventilationScore) *
                100 -
            100;
        daylightImprovement =
            (LocalVariables.roomData[roomNumber - 1].daylightScore / LocalVariables.roomData[0].daylightScore) *
                100 -
            100;
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
    let score = LocalVariables.roomData[roomNumber - 1].daylightScore;
    if (scoreType == ScoreType.Ventilation) score = LocalVariables.roomData[roomNumber - 1].ventilationScore;
    if (score > 3.0) scoreRating = "good";
    else if (score < 2.0) scoreRating = "low";

    // Find the correct texts
    let scoreHeading = "";
    let scoreText = "";
    switch (scoreRating) {
        case "good":
            scoreHeading = daylightTextsGood[0];
            scoreText = daylightTextsGood[1];
            if (scoreType == ScoreType.Ventilation) {
                scoreHeading = ventilationTextsGood[0];
                scoreText = ventilationTextsGood[1];
            }
            break;
        case "medium":
            scoreHeading = daylightTextsMedium[0];
            scoreText = daylightTextsMedium[1];
            if (scoreType == ScoreType.Ventilation) {
                scoreHeading = ventilationTextsMedium[0];
                scoreText = ventilationTextsMedium[1];
            }
            break;
        case "low":
            scoreHeading = daylightTextsLow[0];
            scoreText = daylightTextsLow[1];
            if (scoreType == ScoreType.Ventilation) {
                scoreHeading = ventilationTextsLow[0];
                scoreText = ventilationTextsLow[1];
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
    let value = LocalVariables.roomData[roomNumber - 1].daylightImprovementPercentage;
    let isHigher = value > LocalVariables.roomData[0].daylightImprovementPercentage;
    let isLower = value < LocalVariables.roomData[0].daylightImprovementPercentage;

    // Set the the references (text & value)
    let valueElement = references.domElements["daylightPercentageClimate"];
    let textElement = references.domElements["daylightPercentageTextClimate"];

    // Set the results
    let textEqual = daylightPercentageTextEqual;
    let textHigher = daylightPercentageTextHigher;
    let textLower = daylightPercentageTextLower;

    // Overwrite the references, if necessary
    if (scoreType == ScoreType.Daylight) {
        // In case of upating the daylight values, the references are already set
        // So we only need to update the icon
        updateArrowImage(references.domElements["daylightArrowImages"], isHigher);
    } else if (scoreType == ScoreType.Ventilation) {
        // Ventilation: Re-calculate the values
        value = LocalVariables.roomData[roomNumber - 1].ventilationImprovementPercentage;
        isHigher = value > LocalVariables.roomData[0].ventilationImprovementPercentage;
        isLower = value < LocalVariables.roomData[0].ventilationImprovementPercentage;

        // Set the references
        valueElement = references.domElements["ventilationPercentageClimate"];
        textElement = references.domElements["ventilationPercentageTextClimate"];

        // Set the results
        textEqual = ventilationPercentageTextEqual;
        textHigher = ventilationPercentageTextHigher;
        textLower = ventilationPercentageTextLower;

        // Update the icon
        updateArrowImage(references.domElements["ventilationArrowImages"], isHigher);
    } else if (scoreType == ScoreType.AirRenewalTimes) {
        // AirRenewalTimes: Re-calculate the values
        value = LocalVariables.roomData[roomNumber - 1].airRenewalTime;
        isHigher = value > LocalVariables.roomData[0].airRenewalTime;
        isLower = value < LocalVariables.roomData[0].airRenewalTime;

        // Set the references
        valueElement = references.domElements["ventilationMinutesClimate"];
        textElement = references.domElements["ventilationMinutesTextClimate"];

        // The result is not dependent on the percentage value
        textEqual = textHigher = textLower = airRenewalTimeText + " " + value + " minutes";

        // Update the icon
        updateArrowImage(references.domElements["ventilationMinutesArrowImages"], isHigher);
    }

    // Set the percentage value and the text
    valueElement.innerHTML = value + "%";
    if (scoreType == ScoreType.AirRenewalTimes) valueElement.innerHTML = value + " min";
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
    let sliderText = references.domElements["daylightValueSlider"];
    let slideButtonText = references.domElements["daylightValueButton"];

    // Construct the text for the slider value and send the current value to the streamer
    let updateSlider = function (value) {
        let tod = new Date(0, 0, 0, 0, 0, 0, 0);
        tod.setTime(tod.getTime() + value * 60000); // Add slider value in milliseconds

        sliderText.innerHTML = slideButtonText.innerHTML =
            tod.getHours() + ":" + tod.getMinutes().toString().padStart(2, "0");
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
    references.domElements["buttonReadMoreClimateScores"].addEventListener(
        "click",
        function onOverlayClick(event) {
            // Fade in the overlay and make it block clicks
            references.domElements["overlayClimateScores"].classList.remove("no-pointer");
            references.domElements["overlayClimateScores"].classList.add("fade-in");

            // Move out the drawer
            references.domElements["drawerClimateScores"].classList.add("move-in");
        }
    );
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
