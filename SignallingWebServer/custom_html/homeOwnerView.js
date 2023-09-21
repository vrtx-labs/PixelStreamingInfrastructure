import { setupJoystick } from "./joystick.js";
import { CommunicationKeys, sendToStreamer, setupStreamerCommunication } from "./streamerCommunication.js";

// Constants
//const localStoragePrefix = "velux.";

// Enumn
class MenuContent {
    static Help = new MenuContent("Help");
    static RoomOptions = new MenuContent("RoomOptions");
    static DaylightSlider = new MenuContent("DaylightSlider");
    static Link = new MenuContent("Link");
    static Screenshot = new MenuContent("Screenshot");

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `menuContent.${this.name}`;
    }
}

// Variables
const domElements = {}; // Holds references to DOM elements
const LocalVariables = {
    menuActive: false,
};

// Setup: The event is linked to app.js OnLoadFinished in the setup function
window.addEventListener("OnLoadFinished", () => {
    setup();
});

function setup() {
    getDOMElements();
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
    setupCopyLinkButton();
    setupMenuContentButtons();
    setupToggleMenuButton();
    setupRoomButtons();
    setupSlider();
    setupJoystick();
}

function getURLParameter(parameter) {
    const parsedUrl = new URL(window.location.href);
    const projectID = parsedUrl.searchParams.has(CommunicationKeys.projectIDKey)
        ? parsedUrl.searchParams.get(CommunicationKeys.projectIDKey)
        : null;

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
        const roomName = getURLParameter(CommunicationKeys.activeRoomKey);
        console.log(`roomName: ${roomName}`);
        if (roomName !== null) sendToStreamer(CommunicationKeys.activeRoomKey, roomName);
    }, 350);
}

function setupToggleMenuButton() {
    domElements["toggleMenuButton"].addEventListener("click", function onOverlayClick(event) {
        console.log("toggle menu");
        toggleMenu();
    });
}

function setupScreenshotButton() {
    domElements["buttonScreenshot"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.screenshotKey, "true");
    });
}

function setupCopyLinkButton() {
    domElements["buttonCopyLink"].addEventListener("click", function onOverlayClick(event) {
        // Copy current url to clipboard
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(window.location.href).then(
            function () {
                console.log("Async: Copying to clipboard was successful!");
            },
            function (err) {
                console.error("Async: Could not copy text: ", err);
            }
        );
    });
}

function toggleMenu() {
    let menu = domElements["menu"];

    if (LocalVariables.menuActive) {
        LocalVariables.menuActive = false;
        // Toggle the menu by switching the class
        menu.classList.remove("menu-visible");
        menu.classList.add("menu-hidden");
    } else {
        LocalVariables.menuActive = true;
        // Toggle the menu by switching the class
        menu.classList.add("menu-visible");
        menu.classList.remove("menu-hidden");
    }

    // Toggle the button icon
    domElements["menuArrowDown"].classList.toggle("hiddenState");
    domElements["menuArrowUp"].classList.toggle("hiddenState");
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
    //domElements["buttonShare"].addEventListener("click", function onOverlayClick(event) {
    //    showMenuContent(MenuContent.Link);
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
    domElements["menuContentLink"].classList.add("hiddenState");
    domElements["menuContentScreenshot"].classList.add("hiddenState");
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
        case MenuContent.Link:
            domElements["menuContentLink"].classList.remove("hiddenState");
            break;
        case MenuContent.Screenshot:
            domElements["menuContentScreenshot"].classList.remove("hiddenState");
            break;
        default:
            break;
    }
}

function setupRoomButtons() {
    domElements["buttonRoom1"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "1");
        setRoomButtonActive(this);
    });
    domElements["buttonRoom2"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "2");
        setRoomButtonActive(this);
    });
    domElements["buttonRoom3"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "3");
        setRoomButtonActive(this);
    });
    domElements["buttonRoom4"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(CommunicationKeys.activeRoomKey, "4");
        setRoomButtonActive(this);
    });
}

function setRoomButtonActive(element) {
    domElements["buttonRoom1"].classList.remove("selected-room");
    domElements["buttonRoom2"].classList.remove("selected-room");
    domElements["buttonRoom3"].classList.remove("selected-room");
    domElements["buttonRoom4"].classList.remove("selected-room");
    element.classList.add("selected-room");
}

function setupSlider() {
    let slider = domElements["daylightSlider"];
    let sliderText = domElements["dayLightSliderText"];

    // Construct the text for the slider value and send the current value to the streamer
    let updateSlider = function (value) {
        let tod = new Date(0, 0, 0, 0, 0, 0, 0);
        tod.setTime(tod.getTime() + value * 60000); // Add slider value in milliseconds

        sliderText.innerHTML = tod.getHours() + ":" + ("00" + tod.getMinutes()).substr(-2);
        sendToStreamer(CommunicationKeys.daylightSliderKey, (value / 1440).toFixed(2));
    };

    // Update the current slider value each time the slider handle is dragged
    slider.oninput = function () {
        updateSlider(this.value);
    };

    // Update the slider value at start
    updateSlider(slider.value);
}

function activateDefaultSettings() {
    // Set match viewport resolution to true
    setRadioButtonState("match-viewport-res-tgl", true);

    // Set the control scheme to Hovering Mouse
    setRadioButtonState("control-tgl", true);

    // Hide the cursor
    setRadioButtonState("cursor-tgl", true);

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

function getDOMElements() {
    domElements["videoPlayOverlay"] = document.getElementById("videoPlayOverlay");
    domElements["menu"] = document.getElementById("lowerMenu");
    domElements["toggleMenuButton"] = document.getElementById("buttonToggleMenu");
    domElements["menuArrowDown"] = document.getElementById("menuArrowDown");
    domElements["menuArrowUp"] = document.getElementById("menuArrowUp");
    domElements["menuContentHelp"] = document.getElementById("containerHelp");
    domElements["menuContentRoomOptions"] = document.getElementById("containerRoomOptions");
    domElements["menuContentDaylightSlider"] = document.getElementById("containerSliderDaylight");
    domElements["menuContentLink"] = document.getElementById("containerLink");
    domElements["menuContentScreenshot"] = document.getElementById("containerScreenshot");
    domElements["buttonRoomOptions"] = document.getElementById("buttonRoomOptions");
    domElements["buttonDaylight"] = document.getElementById("buttonDaylight");
    domElements["menuButtonScreenshot"] = document.getElementById("buttonScreenshot");
    domElements["buttonScreenshot"] = document.getElementById("buttonScreenshot");
    domElements["buttonShare"] = document.getElementById("buttonShare");
    domElements["buttonHelp"] = document.getElementById("buttonHelp");
    domElements["buttonRoom1"] = document.getElementById("buttonRoom1");
    domElements["buttonRoom2"] = document.getElementById("buttonRoom2");
    domElements["buttonRoom3"] = document.getElementById("buttonRoom3");
    domElements["buttonRoom4"] = document.getElementById("buttonRoom4");
    domElements["daylightSlider"] = document.getElementById("sliderDaylight");
    domElements["dayLightSliderText"] = document.getElementById("daylightValue");
    domElements["buttonCopyLink"] = document.getElementById("buttonCopyLink");
    domElements["containerButtonDaylight"] = document.getElementById("containerButtonDaylight");
    domElements["containerButtonRoomOptions"] = document.getElementById("containerButtonRoomOptions");
    domElements["breadcrumbs"] = document.getElementById("breadcrumbs");
}
