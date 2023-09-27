import { domElements, getDOMElements } from "./references.js";
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
};

// Setup: The event is linked to app.js OnLoadFinished in the setup function
window.addEventListener("OnLoadFinished", () => {
    setup();
});

function setup() {
    getDOMElements();
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

    // Update UI state
    setActiveRoom();
    setBreadcrumbs(domElements["buttonRoom1"].innerHTML, LocalVariables.projectName);
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
    domElements["videoPlayOverlay"].addEventListener("click", function onOverlayClick(event) {
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
                setBreadcrumbs(domElements["buttonRoom1"].innerHTML, LocalVariables.projectName);
                break;
            case CommunicationKeys.roomNamesKey:
                // Set the room names
                setRoomName(domElements["buttonRoom1"], incomingObject[CommunicationKeys.roomNamesKey]["1"]);
                setRoomName(domElements["buttonRoom2"], incomingObject[CommunicationKeys.roomNamesKey]["2"]);
                setRoomName(domElements["buttonRoom3"], incomingObject[CommunicationKeys.roomNamesKey]["3"]);
                setRoomName(domElements["buttonRoom4"], incomingObject[CommunicationKeys.roomNamesKey]["4"]);

                // Activate the first room
                domElements["buttonRoom1"].classList.add("selected-room");
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

    domElements["breadcrumbs"].innerHTML = project + " / " + room;
}

function setRoomName(element, name) {
    // Check the name string for whitespace
    if (name === undefined || name === null || name.trim() === "") element.classList.add("hiddenState");
    element.innerHTML = name;
    element.classList.remove("selected-room");
}

function setupToggleMenuButton() {
    domElements["toggleMenuButton"].addEventListener("click", function onOverlayClick(event) {
        toggleMenu();
    });
}

function setupScreenshotButton() {
    domElements["buttonScreenshot"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.screenshotKey, "true");
    });
}

function setupShareButton() {
    domElements["buttonShare"].addEventListener("click", function onOverlayClick(event) {
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
                domElements["buttonShare"],
                domElements["buttonRefresh"],
                domElements["buttonHelp"],
                domElements["buttonScreenshot"],
                domElements["collapseMenuImage"],
            ],
            "fade-in",
            false
        );

        // And adding the fade-out class
        setClassActive(
            [
                domElements["buttonShare"],
                domElements["buttonRefresh"],
                domElements["buttonHelp"],
                domElements["buttonScreenshot"],
                domElements["collapseMenuImage"],
            ],
            "fade-out",
            true,
            true // Hide after animation
        );
    } else {
        LocalVariables.menuActive = true;
        // Show the menu by adding the fade-in class
        setClassActive(
            [
                domElements["buttonShare"],
                domElements["buttonRefresh"],
                domElements["buttonHelp"],
                domElements["buttonScreenshot"],
                domElements["collapseMenuImage"],
            ],
            "fade-in",
            true
        );

        // And removing the fade-out class
        setClassActive(
            [
                domElements["buttonShare"],
                domElements["buttonRefresh"],
                domElements["buttonHelp"],
                domElements["buttonScreenshot"],
                domElements["collapseMenuImage"],
            ],
            "fade-out",
            false
        );
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
    domElements["buttonRoomOptions"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.RoomOptions);
    });
    domElements["buttonDaylight"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.DaylightSlider);
    });
    //domElements["menuButtonScreenshot"].addEventListener("click", function onOverlayClick(event) {
    //    showMenuContent(MenuContent.Screenshot);
    //});
    //domElements["buttonHelp"].addEventListener("click", function onOverlayClick(event) {
    //    showMenuContent(MenuContent.Help);
    //});
}

function showMenuContent(menuContent) {
    // Check menuContent type
    if (!(menuContent instanceof MenuContent)) return;

    // Disable all elements
    domElements["menuContentRoomOptions"].classList.add("hiddenState");
    domElements["menuContentDaylightSlider"].classList.add("hiddenState");
    domElements["menuContentHelp"].classList.add("hiddenState");

    // Switch the menu content in a switch case statement
    switch (menuContent) {
        case MenuContent.Help:
            domElements["menuContentHelp"].classList.remove("hiddenState");
            break;
        case MenuContent.RoomOptions: // Room Options and Daylight Slider are mutually exclusive
            domElements["menuContentRoomOptions"].classList.remove("hiddenState");
            domElements["containerButtonRoomOptions"].classList.add("hiddenState");
            domElements["containerButtonDaylight"].classList.remove("hiddenState");
            break;
        case MenuContent.DaylightSlider:
            domElements["menuContentDaylightSlider"].classList.remove("hiddenState");
            domElements["containerButtonDaylight"].classList.add("hiddenState");
            domElements["containerButtonRoomOptions"].classList.remove("hiddenState");
            break;
        default:
            break;
    }
}

function setupRoomButtons() {
    domElements["buttonRoom1"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "1");
        setActiveRoom(this);
    });
    domElements["buttonRoom2"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "2");
        setActiveRoom(this);
    });
    domElements["buttonRoom3"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "3");
        setActiveRoom(this);
    });
    domElements["buttonRoom4"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "4");
        setActiveRoom(this);
    });
}

function setActiveRoom(element = undefined) {
    if (element === undefined) element = domElements["buttonRoom1"];

    // Unmark all, then mark the selected room
    domElements["buttonRoom1"].classList.remove("selected-room");
    domElements["buttonRoom2"].classList.remove("selected-room");
    domElements["buttonRoom3"].classList.remove("selected-room");
    domElements["buttonRoom4"].classList.remove("selected-room");
    element.classList.add("selected-room");

    // Update the breadcrumbs in the top-left corner
    setBreadcrumbs(element.innerHTML);

    // Update the daylight and ventilation scores
    let index = Array.prototype.indexOf.call(element.parentNode.children, element); // Get position of element in the DOM
    domElements["daylightScore"].innerHTML = LocalVariables.daylightScores[index].toFixed(1);
    domElements["ventilationScore"].innerHTML = LocalVariables.ventilationScores[index].toFixed(1);
}

function setupSlider() {
    let slider = domElements["daylightSlider"];
    let sliderText = domElements["dayLightSliderText"];

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
