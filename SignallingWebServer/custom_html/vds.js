// Constants
//const localStoragePrefix = "velux.";
const projectIDKey = "projectID";
const roomNameKey = "roomName";
const projectViewKey = "projectView";
const settingsProjectViewKey = "settingsProjectView";
const roomOptionKey = "roomOption";
const daylightSliderKey = "daylightSliderValue";
const screenshotKey = "screenshot";
const mouseControlSchemeKey = "hoveringMouse";
const domElements = {};

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

function setup() {
    getDOMElements();
    setupPlayButton();
    setupToggleMenuButton();
    setupMenuContentButtons();
    setupRoomButtons();
    setupSlider();

    setTimeout(function () {
        activateDefaultSettings();
    }, 50);
}

function startStream() {
    // Wait for the connection to establish - ToDo: React to a proper event or let the Unreal Application send one
    setTimeout(function () {
        // Read html attribute 'ProjectID'
        const roomName = getURLParameter(roomNameKey);
        console.log(`roomName: ${roomName}`);
        if (roomName !== null) sendToStreamer(roomNameKey, roomName);
    }, 350);
}

function sendToStreamer(key, value) {
    let descriptor = {
        [key]: value,
    };
    emitUIInteraction(descriptor);
    console.log(`Message to streamer: ${key} = ${value}`);
}

function setupPlayButton() {
    domElements["videoPlayOverlay"].addEventListener("click", function onOverlayClick(event) {
        startStream();
    });
}

function setupToggleMenuButton() {
    domElements["toggleMenuButton"].addEventListener("click", function onOverlayClick(event) {
        console.log("toggle menu");
        toggleMenu();
    });
}

function toggleMenu() {
    // Toggle the menu by switching the class
    let menu = domElements["menu"];
    menu.classList.toggle("menu-hidden");
    menu.classList.toggle("menu-visible");

    // Toggle the button icon
    domElements["menuArrowDown"].classList.toggle("hiddenState");
    domElements["menuArrowUp"].classList.toggle("hiddenState");
}

function setupMenuContentButtons() {
    domElements["buttonRoomOptions"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(true);
    });
    domElements["buttonTimeOfDay"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(false);
    });
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
            break;
        case MenuContent.RoomOptions:
            domElements["menuContentRoomOptions"].classList.remove("hiddenState");
            break;
        case MenuContent.DaylightSlider:
            containerSliderDaylight.classList.remove("hiddenState");
            break;
        case MenuContent.Link:
            break;
        case MenuContent.Screenshot:
            break;
        default:
            break;
    }

    if (roomOptionsActive) {
    } else {
    }
}

function setupRoomButtons() {
    domElements["buttonRoom1"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(roomNameKey, "1");
    });
    domElements["buttonRoom2"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(roomNameKey, "2");
    });
    domElements["buttonRoom3"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(roomNameKey, "3");
    });
    domElements["buttonRoom4"].addEventListener("click", function onOverlayClick(event) {
        sendToStreamer(roomNameKey, "4");
    });
}

function setupSlider() {
    let slider = domElements["daylightSlider"];
    let sliderText = domElements["dayLightSliderText"];

    // Construct the text for the slider value and send the current value to the streamer
    updateSlider = function (value) {
        let tod = new Date(0, 0, 0, 0, 0, 0, 0);
        tod.setTime(tod.getTime() + value * 60000); // Add slider value in milliseconds

        sliderText.innerHTML = tod.getHours() + ":" + ("00" + tod.getMinutes()).substr(-2);
        sendToStreamer(daylightSliderKey, (value / 1440).toFixed(2));
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

function getURLParameter(parameter) {
    const parsedUrl = new URL(window.location.href);
    const projectID = parsedUrl.searchParams.has(projectIDKey) ? parsedUrl.searchParams.get(projectIDKey) : null;

    return projectID;
}

function getDOMElements() {
    domElements["videoPlayOverlay"] = document.getElementById("videoPlayOverlay");
    domElements["menu"] = document.getElementById("lowerMenu");
    domElements["toggleMenuButton"] = document.getElementById("button-toggle-menu");
    domElements["menuArrowDown"] = document.getElementById("menu-arrow-down");
    domElements["menuArrowUp"] = document.getElementById("menu-arrow-up");
    domElements["menuContent"] = document.getElementById("menu-content");
    domElements["menuContentHelp"] = document.getElementById("menu-content-help");
    domElements["menuContentRoomOptions"] = document.getElementById("menu-content-room-options");
    domElements["menuContentDaylightSlider"] = document.getElementById("menu-content-daylight-slider");
    domElements["menuContentLink"] = document.getElementById("menu-content-link");
    domElements["menuContentScreenshot"] = document.getElementById("menu-content-screenshot");
    domElements["buttonRoomOptions"] = document.getElementById("buttonRoomOptions");
    domElements["buttonTimeOfDay"] = document.getElementById("buttonTimeOfDay");
    domElements["buttonScreenshot"] = document.getElementById("buttonScreenshot");
    domElements["buttonLink"] = document.getElementById("button-link");
    domElements["buttonHelp"] = document.getElementById("button-help");
    domElements["buttonRoom1"] = document.getElementById("button-room-1");
    domElements["buttonRoom2"] = document.getElementById("button-room-2");
    domElements["buttonRoom3"] = document.getElementById("button-room-3");
    domElements["buttonRoom4"] = document.getElementById("button-room-4");
    domElements["buttonDaylightSlider"] = document.getElementById("button-daylight-slider");
    domElements["daylightSlider"] = document.getElementById("sliderDaylight");
    domElements["dayLightSliderText"] = document.getElementById("daylightValue");
}

/*
function localStorageSet(localStorageKey, localStorageValue) {
    window.localStorage.setItem(
        localStoragePrefix + localStorageKey,
        JSON.stringify(localStorageValue)
    );
}

function localStorageGet(localStorageKey) {
    JSON.parse(
        window.localStorage.getItem(localStoragePrefix + localStorageKey)
    );
}
*/
