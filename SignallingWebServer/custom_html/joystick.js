/*
Copyright (c) 2023 by Jeff Treleaven (https://codepen.io/jiffy/pen/zrqwON)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { CommunicationKeys, sendToStreamer } from "./streamerCommunication.js";

// Constants
const joystickPublishInterval = 16; // in milliseconds

// Variables
const LocalVariables = {
    joystickCenter: null,
    joystickIntervalCache: null,
    joystickX: 0,
    joystickY: 0,
};

export function setupJoystick() {
    var xCenter = 150;
    var yCenter = 150;

    // Draw the joystick center
    LocalVariables.joystickCenter = new createjs.Shape();
    setJoystickCenterColor();

    //// Add image
    //var image = new Image();
    //image.src = "./images/icons/footprint.svg";
    //image.onload = function () {
    //    // https://stackoverflow.com/questions/10593030/html-canvas-not-displaying-image
    //    pic.getContext("2d").drawImage(image, 0, 0);

    //    // use create js Graphic to draw the ./images/icons/footprint.svg image on the joystick center
    //    var myGraphics = new createjs.Graphics().beginFill("red").drawCircle(0, 0, 50);
    //    var fillCommand = myGraphics.beginFill("red").command;
    //    fillCommand.bitmap("./images/icons/footprint.svg");

    // Draw the canvas and add the center
    var canvas = new createjs.Stage("joystick");
    canvas.addChild(LocalVariables.joystickCenter);

    // Initiate the update routine
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", canvas);
    canvas.update();

    // Create a Hammer instance and bind it to the joystick
    var joystickDOM = document.getElementById("joystick");
    var joystick = new Hammer(joystickDOM);

    // Start callback
    joystick.on("panstart", function (eventData) {
        xCenter = LocalVariables.joystickCenter.x;
        yCenter = LocalVariables.joystickCenter.y;
        setJoystickCenterColor("#ee0000");

        // Reset joystick and start publishing to streamer
        LocalVariables.joystickX = 0;
        LocalVariables.joystickY = 0;
        LocalVariables.joystickIntervalCache = setInterval(updateJoystickStatus, joystickPublishInterval);

        canvas.update();
    });

    // Move callback
    joystick.on("panmove", function (eventData) {
        // Update the visual representation of the joystick
        var coordinates = calculateCoordinates(eventData.angle, eventData.distance);
        LocalVariables.joystickCenter.x = coordinates.x;
        LocalVariables.joystickCenter.y = coordinates.y;
        canvas.update();

        // Cache Values
        LocalVariables.joystickX = Math.min(Math.max(LocalVariables.joystickCenter.x, -100), 100) / 100;
        LocalVariables.joystickY = (Math.min(Math.max(LocalVariables.joystickCenter.y, -100), 100) / 100) * -1;
    });

    // End callback
    joystick.on("panend", function (eventData) {
        // Reset the values to 0 and send them to the streamer
        LocalVariables.joystickX = 0;
        LocalVariables.joystickY = 0;
        updateJoystickStatus();

        // Stop publishing to streamer and reset the joystick
        clearInterval(LocalVariables.joystickIntervalCache);
        setJoystickCenterColor();
        createjs.Tween.get(LocalVariables.joystickCenter).to({ x: xCenter, y: yCenter }, 550, createjs.Ease.elasticOut);
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

function setJoystickCenterColor(color = "#333333", xCenter = 150, yCenter = 150) {
    LocalVariables.joystickCenter.graphics.beginFill(color).drawCircle(xCenter, yCenter, 50);
}

function calculateCoordinates(angle, distance) {
    var coordinates = {};
    distance = Math.min(distance, 100);
    var rads = (angle * Math.PI) / 180.0;

    coordinates.x = distance * Math.cos(rads);
    coordinates.y = distance * Math.sin(rads);

    return coordinates;
}
