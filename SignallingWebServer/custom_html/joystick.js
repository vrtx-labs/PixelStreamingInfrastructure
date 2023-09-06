import { CommunicationKeys, sendToStreamer } from "./streamerCommunication.js";

/*
Copyright (c) 2023 by Jeff Treleaven (https://codepen.io/jiffy/pen/zrqwON)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Constants
const joystickPublishInterval = 16; // in milliseconds

// Variables
const LocalVariables = {
    joystickIntervalCache: null,
    joystickX: 0,
    joystickY: 0,
};

export function setupJoystick() {
    var xCenter = 150;
    var yCenter = 150;

    // Draw the joystick center
    var joystickCenter = new createjs.Shape();
    joystickCenter.graphics.beginFill("#333333").drawCircle(xCenter, yCenter, 50);
    joystickCenter.alpha = 0.25;

    // Draw the joystick base and add the center
    var joystickBase = new createjs.Stage("joystick");
    joystickBase.addChild(joystickCenter);

    // Initiate the update routine
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", joystickBase);
    joystickBase.update();

    // Create a Hammer instance and bind it to the joystick
    var joystickDOM = document.getElementById("joystick");
    var joystick = new Hammer(joystickDOM);

    // Start callback
    joystick.on("panstart", function (eventData) {
        xCenter = joystickCenter.x;
        yCenter = joystickCenter.y;
        joystickCenter.alpha = 0.5;

        // Reset joystick and start publishing to streamer
        LocalVariables.joystickX = 0;
        LocalVariables.joystickY = 0;
        LocalVariables.joystickIntervalCache = setInterval(updateJoystickStatus, joystickPublishInterval);

        joystickBase.update();
    });

    // Move callback
    joystick.on("panmove", function (eventData) {
        var pos = $("#joystick").position(); // Todo: is this cached already?

        // Cache current position
        let x = eventData.center.x - pos.left - 150;
        let y = eventData.center.y - pos.top - 150;
        LocalVariables.joystickX = Math.min(Math.max(x, -100), 100) / 100;
        LocalVariables.joystickY = (Math.min(Math.max(y, -100), 100) / 100) * -1;

        // Update the visual representation of the joystick
        var coordinates = calculateCoordinates(eventData.angle, eventData.distance);
        joystickCenter.x = coordinates.x;
        joystickCenter.y = coordinates.y;
        joystickBase.update();
    });

    // End callback
    joystick.on("panend", function (eventData) {
        // Stop publishing to streamer and reset the joystick
        clearInterval(LocalVariables.joystickIntervalCache);
        joystickCenter.alpha = 0.25;
        createjs.Tween.get(joystickCenter).to({ x: xCenter, y: yCenter }, 750, createjs.Ease.elasticOut);
    });
}

function updateJoystickStatus() {
    // Send current joystick position to streamer
    // Format: {"joystickValues":{"x":"1.00","y":"-0.07"}}
    let descriptor = {
        x: LocalVariables.joystickX.toFixed(2),
        y: LocalVariables.joystickY.toFixed(2),
    };
    sendToStreamer(CommunicationKeys.joystickValuesKey, descriptor);
}

function calculateCoordinates(angle, distance) {
    var coordinates = {};
    distance = Math.min(distance, 100);
    var rads = (angle * Math.PI) / 180.0;

    coordinates.x = distance * Math.cos(rads);
    coordinates.y = distance * Math.sin(rads);

    return coordinates;
}
