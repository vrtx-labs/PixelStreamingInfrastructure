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
const joystickValuesKey = "joystickValues";

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
const GlobalVariables = {
    menuActive: false,
    joystickX: 0,
    joystickY: 0,
};

// Setup: The event is linked to app.js OnLoadFinished in the setup function
window.addEventListener("OnLoadFinished", () => {
    setup();
});

function setup() {
    getDOMElements();
    setupUIElements();
    activateDefaultSettings();
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
    addResponseEventListener("handle_responses", receiveFromStreamer);
}

function getURLParameter(parameter) {
    const parsedUrl = new URL(window.location.href);
    const projectID = parsedUrl.searchParams.has(projectIDKey) ? parsedUrl.searchParams.get(projectIDKey) : null;

    return projectID;
}

function sendToStreamer(key, value) {
    let descriptor = {
        [key]: value,
    };
    emitUIInteraction(descriptor);
    console.log(`Message to streamer: ${JSON.stringify(descriptor)}`);
}

function receiveFromStreamer(response) {
    console.log(`Received response message from streamer: "${response}"`);
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
        const roomName = getURLParameter(roomNameKey);
        console.log(`roomName: ${roomName}`);
        if (roomName !== null) sendToStreamer(roomNameKey, roomName);
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
        sendToStreamer(screenshotKey, "true");
    });
}

function setupCopyLinkButton() {
    domElements["buttonCopyLink"].addEventListener("click", function onOverlayClick(event) {
        // Copy current url to clipboard
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

    if (GlobalVariables.menuActive) {
        GlobalVariables.menuActive = false;
        // Toggle the menu by switching the class
        menu.classList.remove("menu-visible");
        menu.classList.add("menu-hidden");
    } else {
        GlobalVariables.menuActive = true;
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
    domElements["buttonTimeOfDay"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.DaylightSlider);
    });
    domElements["menuButtonScreenshot"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.Screenshot);
    });
    domElements["buttonLink"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.Link);
    });
    domElements["buttonHelp"].addEventListener("click", function onOverlayClick(event) {
        showMenuContent(MenuContent.Help);
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
            domElements["menuContentHelp"].classList.remove("hiddenState");
            break;
        case MenuContent.RoomOptions:
            domElements["menuContentRoomOptions"].classList.remove("hiddenState");
            break;
        case MenuContent.DaylightSlider:
            containerSliderDaylight.classList.remove("hiddenState");
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
    let updateSlider = function (value) {
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

function setupJoystick() {
    initJoystick();
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
    domElements["buttonTimeOfDay"] = document.getElementById("buttonTimeOfDay");
    domElements["menuButtonScreenshot"] = document.getElementById("buttonScreenshotMenu");
    domElements["buttonScreenshot"] = document.getElementById("buttonScreenshot");
    domElements["buttonLink"] = document.getElementById("buttonLink");
    domElements["buttonHelp"] = document.getElementById("buttonHelp");
    domElements["buttonRoom1"] = document.getElementById("buttonRoom1");
    domElements["buttonRoom2"] = document.getElementById("buttonRoom2");
    domElements["buttonRoom3"] = document.getElementById("buttonRoom3");
    domElements["buttonRoom4"] = document.getElementById("buttonRoom4");
    domElements["daylightSlider"] = document.getElementById("sliderDaylight");
    domElements["dayLightSliderText"] = document.getElementById("daylightValue");
    domElements["buttonCopyLink"] = document.getElementById("buttonCopyLink");
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

/* ToDo: Import this from a separate file
Copyright (c) 2023 by Jeff Treleaven (https://codepen.io/jiffy/pen/zrqwON)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function initJoystick() {
    // easal stuff goes hur
    var xCenter = 150;
    var yCenter = 150;
    var stage = new createjs.Stage("joystick");

    var psp = new createjs.Shape();
    psp.graphics.beginFill("#333333").drawCircle(xCenter, yCenter, 50);

    psp.alpha = 0.25;

    var vertical = new createjs.Shape();
    var horizontal = new createjs.Shape();
    vertical.graphics.beginFill("#ff4d4d").drawRect(150, 0, 2, 300);
    horizontal.graphics.beginFill("#ff4d4d").drawRect(0, 150, 300, 2);

    stage.addChild(psp);
    stage.addChild(vertical);
    stage.addChild(horizontal);
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", stage);
    stage.update();

    var joystick = document.getElementById("joystick");

    // create a simple instance
    // by default, it only adds horizontal recognizers
    var mc = new Hammer(joystick);

    mc.on("panstart", function (ev) {
        var pos = joystick.offsetWidth - parseInt(joystick.style.width);
        xCenter = psp.x;
        yCenter = psp.y;
        psp.alpha = 0.5;

        stage.update();
    });

    // listen to events...
    mc.on("panmove", function (ev) {
        var pos = $("#joystick").position();

        let x = ev.center.x - pos.left - 150;
        let y = ev.center.y - pos.top - 150;

        GlobalVariables.joystickX = Math.min(Math.max(x, -100), 100) / 100;
        GlobalVariables.joystickY = Math.min(Math.max(y, -100), 100) / 100;

        document.getElementById("xVal").innerText = "X: " + GlobalVariables.joystickX;
        document.getElementById("yVal").innerText = "Y: " + GlobalVariables.joystickY;

        var coords = calculateCoords(ev.angle, ev.distance);

        psp.x = coords.x;
        psp.y = coords.y;

        psp.alpha = 0.5;

        stage.update();
    });

    mc.on("panend", function (ev) {
        GlobalVariables.joystickX = 0;
        GlobalVariables.joystickY = 0;
        document.getElementById("xVal").innerText = "X: " + GlobalVariables.joystickX;
        document.getElementById("yVal").innerText = "Y: " + GlobalVariables.joystickY;

        psp.alpha = 0.25;
        createjs.Tween.get(psp).to({ x: xCenter, y: yCenter }, 750, createjs.Ease.elasticOut);
    });
}

function calculateCoords(angle, distance) {
    var coords = {};
    distance = Math.min(distance, 100);
    var rads = (angle * Math.PI) / 180.0;

    coords.x = distance * Math.cos(rads);
    coords.y = distance * Math.sin(rads);

    return coords;
}
