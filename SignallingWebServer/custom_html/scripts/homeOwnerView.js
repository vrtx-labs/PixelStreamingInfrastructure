import * as references from "./references.js";
import * as serverCommunication from "./serverCommunication.js";
import * as streamerCommunication from "./streamerCommunication.js";
import * as localization from "./localization.js";
import { MenuContent, ScoreType, Room, Project } from "./dataModels.js";
import { setupJoystick } from "./joystick.js";
import "./serverCommunication.js";
import "./global.js"; // ToDo: Find a better place for the code in here

// Variables
const LocalVariables = {
    designAdvisorViewActive: false,
    toolbarActive: false,
    projectName: "Default Project",
    projectID: null,
    roomID: null,
    roomData: [null, null, null, null],
    timeFormatUseAMPM: false,
};

// Setup: The event is linked to app.js OnLoadFinished in the setup function
window.addEventListener("OnLoadFinished", () => {
    setup();
});

async function setup() {
    // Get the project ID from the URL
    LocalVariables.projectID = getURLParameter(streamerCommunication.CommunicationKeys.projectIDKey);
    LocalVariables.designAdvisorViewActive = LocalVariables.projectID === null;
    LocalVariables.roomID = getURLParameter(streamerCommunication.CommunicationKeys.roomIDKey);
    console.log(`projectID: ${LocalVariables.projectID}`);
    console.log(`roomID: ${LocalVariables.roomID}`);

    // Request project data from the server. On Success, setup the frontend
    await serverCommunication
        .getProjectData(LocalVariables.projectID, LocalVariables.roomID)
        .then((projectData) => {
            // Set the room data after successfully fetching it, then continue with the setup
            LocalVariables.projectName = projectData.name;
            LocalVariables.roomData = projectData.rooms;
            setupFrontend();
        })
        .catch((error) => {
            // Handle any errors that occurred during the fetch request
            console.error(`An error occurred while processing the fetched project data. ${error}`);

            //// Fill room data with mock-up data
            ////LocalVariables.projectID = null;
            ////LocalVariables.designAdvisorViewActive = true;
            //LocalVariables.roomData = [null, null, null, null];
            //for (let roomIndex = 0; roomIndex < LocalVariables.roomData.length; roomIndex++) {
            //    LocalVariables.roomData[roomIndex] = new Room(
            //        "Room " + (roomIndex + 1),
            //        roomIndex * 1.1,
            //        roomIndex + 1.9,
            //        12 - roomIndex * 4
            //    );
            //}
            setupFrontend();
        });
}

function setupFrontend() {
    references.getDOMElements();
    setupUIElements();
    setupStreamerCommunication();
    streamerCommunication.setupStreamerCommunication();
    activateDefaultSettings();
    setTimeout(function () {
        scrollToTop();
    }, 50);
}

function setupUIElements() {
    localization.initialize();
    setupScreenshotButton();
    setupRefreshButton();
    setupShareButton();
    setupMenuContentButtons();
    setupToggleMenuButton();
    setupRoomButtons();
    setupSlider();
    setupJoystick();
    setupClimateDrawer();

    // Update UI state
    setMenuActive(!LocalVariables.designAdvisorViewActive);
    setActiveRoom();
    setBreadcrumbs();
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

function setMenuActive(active) {
    if (active) {
        references.domElements["containerMenu"].classList.remove("hiddenState");
        references.domElements["containerFooter"].classList.remove("hiddenState");
        references.domElements["logoVelux"].classList.remove("hiddenState");
        references.domElements["containerFeedback"].classList.add("hiddenState");
    } else {
        references.domElements["containerMenu"].classList.add("hiddenState");
        references.domElements["containerFooter"].classList.add("hiddenState");
        references.domElements["logoVelux"].classList.add("hiddenState");
        references.domElements["containerFeedback"].classList.remove("hiddenState");
    }
}

function setupStreamerCommunication() {
    // Wait for the connection to establish
    window.addEventListener("streamer_response", function (event) {
        const incomingObject = JSON.parse(event.detail);
        if (incomingObject.hasOwnProperty("handshake")) {
            // Handshake received
            console.log(`Handshake received from streamer.`);
            startStream();
            return;
        }
        const daylightSliderValue = incomingObject[streamerCommunication.CommunicationKeys.daylightSliderKey];
        if (daylightSliderValue !== undefined) {
            // Daylight slider value received
            console.log(`Daylight slider value received from streamer: ${daylightSliderValue}`);
            references.domElements["daylightSlider"].value = daylightSliderValue * 1440;
            updateSlider();
            return;
        }
    });
}

function startStream() {
    // Send inital data to streamer
    streamerCommunication.sendHandshakeToStreamer(
        LocalVariables.designAdvisorViewActive,
        LocalVariables.projectID,
        LocalVariables.roomID
    );

    // Update the slider value at start
    updateSlider();
}

function setBreadcrumbs() {
    const hasProjectID = LocalVariables.projectID !== null;
    const hasRoomID = LocalVariables.roomID !== null;
    if (!hasProjectID && !hasRoomID) {
        references.domElements["breadcrumbs"].innerHTML = "";
        return;
    }

    const project = LocalVariables.projectName;
    const room = LocalVariables.roomData[0]?.name;

    if (hasProjectID && hasRoomID) references.domElements["breadcrumbs"].innerHTML = project + " / " + room;
    else if (hasProjectID) references.domElements["breadcrumbs"].innerHTML = project;
}

function setupScreenshotButton() {
    references.domElements["buttonScreenshot"].addEventListener("click", function onOverlayClick(event) {
        streamerCommunication.sendToStreamer(streamerCommunication.CommunicationKeys.screenshotKey, "true");
    });
}

function setupRefreshButton() {
    references.domElements["buttonRefresh"].addEventListener("click", function onOverlayClick(event) {
        streamerCommunication.sendToStreamer(streamerCommunication.CommunicationKeys.refreshKey, "true");
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

function setupToggleMenuButton() {
    references.domElements["containerButtonToggleMenu"].addEventListener(
        "click",
        function onOverlayClick(event) {
            toggleMenu();
        }
    );
}

function toggleMenu() {
    if (LocalVariables.toolbarActive) {
        LocalVariables.toolbarActive = false;
        // Hide the menu by removing the move-in class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
            ],
            "move-in",
            false
        );

        // Timeout to wait for the animation to finish
        setTimeout(function () {
            // Show menuButtonImage and toggle text
            references.domElements["toggleMenuButtonText"].classList.remove("hiddenState");
            references.domElements["menuButtonImage"].classList.add("fade-in");

            // Hide menu collapse icon
            references.domElements["collapseMenuImage"].classList.remove("fade-in");

            // Grow menu button container
            references.domElements["containerButtonToggleMenu"].classList.add("grow");
        }, 600);
    } else {
        LocalVariables.toolbarActive = true;
        // Show the menu by adding the move-in class
        setClassActive(
            [
                references.domElements["buttonShare"],
                references.domElements["buttonRefresh"],
                references.domElements["buttonHelp"],
                references.domElements["buttonScreenshot"],
            ],
            "move-in",
            true
        );

        // Hide menuButtonImage and toggle text
        references.domElements["toggleMenuButtonText"].classList.add("hiddenState");
        references.domElements["menuButtonImage"].classList.remove("fade-in");

        // Show menu collapse icon
        references.domElements["collapseMenuImage"].classList.add("fade-in");

        // Shrink menu button container
        references.domElements["containerButtonToggleMenu"].classList.remove("grow");
    }
}

function setClassActive(listOfElements, className, setActive) {
    for (let i = 0; i < listOfElements.length; i++) {
        if (setActive) {
            listOfElements[i].classList.remove("hiddenState");
            listOfElements[i].classList.add(className);
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
            if (LocalVariables.roomData.length > 1)
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
    //  If there is only one room or less in the project, hide all room options
    if (LocalVariables.roomData.length <= 1) {
        references.domElements["menuContentRoomOptions"].classList.add("hiddenState");
    }

    for (let roomNumber = 1; roomNumber <= 4; roomNumber++) {
        // Hide the room, if we have no data for it
        if (roomNumber > LocalVariables.roomData.length || LocalVariables.roomData[roomNumber - 1] === null) {
            references.getRoomElementsByNumber(roomNumber).forEach((element) => {
                element.classList.add("hiddenState");
            });

            continue;
        }

        setRoomName(roomNumber, LocalVariables.roomData[roomNumber - 1]?.name);
        references.getRoomElementsByNumber(roomNumber).forEach((element) => {
            element.addEventListener("click", function onOverlayClick(event) {
                setActiveRoom(roomNumber);
            });
        });
    }
}

async function setRoomName(roomNumber, name) {
    if (roomNumber > 1) name = (await localization.getTranslation("room-option")) + " " + roomNumber;
    else name = await localization.getTranslation("room-original");

    // Get room references
    references.getRoomElementsByNumber(roomNumber).forEach((room) => {
        // Check the name string for whitespace
        if (name === undefined || name === null || name.trim() === "") room.classList.add("hiddenState");
        room.innerHTML = name;
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

    // Update the daylight and ventilation scores
    references.getDaylightScores().forEach((scoreText) => {
        const score = LocalVariables.roomData[roomNumber - 1]?.daylightScore;
        scoreText.innerHTML = score !== null && score !== undefined ? score.toFixed(1) : "-";
    });
    references.getVentilationScores().forEach((scoreText) => {
        const score = LocalVariables.roomData[roomNumber - 1]?.ventilationScore;
        scoreText.innerHTML = score !== null && score !== undefined ? score.toFixed(1) : "-";
    });

    // Update the daylight and ventilation texts
    UpdateScoreTexts(ScoreType.Daylight, roomNumber);
    UpdateScoreTexts(ScoreType.Ventilation, roomNumber);

    // Update percentage values & ventilation renewal times
    updateScoreMetrics(ScoreType.Daylight, roomNumber);
    updateScoreMetrics(ScoreType.Ventilation, roomNumber);
    updateScoreMetrics(ScoreType.AirRenewalTimes, roomNumber);

    // Send to streamer
    streamerCommunication.sendToStreamer(streamerCommunication.CommunicationKeys.activeRoomKey, roomNumber);
}

// Updates either daylight or ventilation texts corresponding to the room number
async function UpdateScoreTexts(scoreType, roomNumber) {
    if (!(scoreType instanceof ScoreType)) return;

    // Score type
    let headerElement = references.domElements["daylightHeadingClimate"];
    let textElement = references.domElements["daylightTextClimate"];
    if (scoreType == ScoreType.Ventilation) {
        headerElement = references.domElements["ventilationHeadingClimate"];
        textElement = references.domElements["ventilationTextClimate"];
    }

    // Determine score
    let score = LocalVariables.roomData[roomNumber - 1]?.daylightScore;
    if (scoreType == ScoreType.Ventilation) score = LocalVariables.roomData[roomNumber - 1]?.ventilationScore;

    // Error case
    if (score === null || score === undefined) {
        headerElement.innerHTML = "Missing data";
        textElement.innerHTML = "";
        return;
    }

    // Score level equals score rounded up to the next integer
    let scoreLevel = Math.ceil(score);
    if (scoreLevel <= 0) scoreLevel = 1;

    // Find the correct texts
    let scoreHeading = "";
    let scoreText = "";
    if (scoreType == ScoreType.Daylight) {
        scoreHeading = await localization.getTranslation(localization.daylightHeadingKey + scoreLevel);
        scoreText = await localization.getTranslation(localization.daylightTextKey + scoreLevel);
    } else if (scoreType == ScoreType.Ventilation) {
        scoreHeading = await localization.getTranslation(localization.ventilationHeadingKey + scoreLevel);
        scoreText = await localization.getTranslation(localization.ventilationTextKey + scoreLevel);
    }

    // Set the texts
    headerElement.innerHTML = scoreHeading;
    textElement.innerHTML = scoreText;
}

async function updateScoreMetrics(scoreType, roomNumber) {
    if (!(scoreType instanceof ScoreType)) return;

    // Compute the percentage value
    let metricValue =
        (LocalVariables.roomData[roomNumber - 1]?.daylightScore / LocalVariables.roomData[0]?.daylightScore) *
            100 -
        100;
    if (scoreType == ScoreType.Ventilation)
        metricValue =
            ((LocalVariables.roomData[roomNumber - 1]?.airRenewalTime /
                LocalVariables.roomData[0]?.airRenewalTime) *
                100 -
                100) *
            -1;
    else if (scoreType == ScoreType.AirRenewalTimes)
        metricValue = LocalVariables.roomData[roomNumber - 1]?.airRenewalTime;

    let isHigher = metricValue > 0;
    let isLower = metricValue < 0;
    let percentageTextIndex = isHigher ? 3 : isLower ? 1 : 2;

    // Set the the references (text & value)
    let valueElement = references.domElements["daylightPercentageClimate"];
    let textElement = references.domElements["daylightPercentageTextClimate"];

    // Set the results
    let text = await localization.getTranslation(localization.daylightPercentageKey + percentageTextIndex);

    // Overwrite the references, if necessary
    if (scoreType == ScoreType.Daylight) {
        // In case of upating the daylight values, the references are already set
        // So we only need to update the icon
        updateArrowImage(references.domElements["daylightArrowImages"], !isLower);
    } else if (scoreType == ScoreType.Ventilation) {
        // Set the references
        valueElement = references.domElements["ventilationPercentageClimate"];
        textElement = references.domElements["ventilationPercentageTextClimate"];

        // Set the results
        text = await localization.getTranslation(localization.ventilationPercentageKey + percentageTextIndex);

        // Update the icon
        updateArrowImage(references.domElements["ventilationArrowImages"], !isLower);
    } else if (scoreType == ScoreType.AirRenewalTimes) {
        // Set the references
        valueElement = references.domElements["ventilationMinutesClimate"];
        textElement = references.domElements["ventilationMinutesTextClimate"];

        // The result is not dependent on the percentage value
        text = await localization.getTranslation(localization.airRenewalTimeKey, metricValue?.toFixed(0));

        // Update the icon
        updateArrowImage(references.domElements["ventilationMinutesArrowImages"], !isLower);
    }

    // Trim the metric value to 0 decimal places and check for missing data
    metricValue = metricValue?.toFixed(0);
    if (isNaN(metricValue) || !isFinite(metricValue) || metricValue === null || metricValue === undefined) {
        metricValue = "- ";
        text = "";
    }

    // Set the percentage value or minutes value and the text
    valueElement.innerHTML = metricValue + "%";
    if (scoreType == ScoreType.AirRenewalTimes) valueElement.innerHTML = metricValue + " m";
    textElement.innerHTML = text;
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
    // Update the current slider value each time the slider handle is dragged (and once at setup)
    updateSlider();
    references.domElements["daylightSlider"].oninput = function () {
        updateSlider();
    };
}

// Construct the text for the slider value and send the current value to the streamer
async function updateSlider() {
    // Get references
    let slider = references.domElements["daylightSlider"];
    let sliderText = references.domElements["daylightValueSlider"];
    let sliderButtonText = references.domElements["daylightValueButton"];

    // Get the current time of day as given by the slider value
    let tod = new Date(0, 0, 0, 0, 0, 0, 0);
    tod.setTime(tod.getTime() + slider.value * 60000); // Add slider value in milliseconds

    // Create a readable time string, either 24 h clock or am/pm
    let timeString = tod.getHours() + ":" + tod.getMinutes().toString().padStart(2, "0");
    if (LocalVariables.timeFormatUseAMPM) timeString = createAMPMTimestring(tod.getHours(), tod.getMinutes());
    sliderText.innerHTML = timeString;
    sliderButtonText.innerHTML = (await localization.getTranslation("daylight-value")) + " " + timeString;

    // Notify streamer of time change
    streamerCommunication.sendToStreamer(
        streamerCommunication.CommunicationKeys.daylightSliderKey,
        (slider.value / 1440).toFixed(6)
    );
}

function createAMPMTimestring(hours, minutes) {
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + minutes + " " + ampm;
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
