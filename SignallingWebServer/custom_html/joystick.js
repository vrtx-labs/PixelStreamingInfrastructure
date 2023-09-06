import { CommunicationKeys, sendToStreamer } from "./streamerCommunication.js";

/*
Copyright (c) 2023 by Jeff Treleaven (https://codepen.io/jiffy/pen/zrqwON)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Constants
const joystickPublishInterval = 5; // in milliseconds

// Variables
const LocalVariables = {
    joystickIntervalCache: null,
    joystickX: 0,
    joystickY: 0,
};

export function setupJoystick() {
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

        LocalVariables.joystickX = 0;
        LocalVariables.joystickY = 0;
        LocalVariables.joystickIntervalCache = setInterval(updateJoystickStatus, joystickPublishInterval);

        stage.update();
    });

    // listen to events...
    mc.on("panmove", function (ev) {
        var pos = $("#joystick").position();

        let x = ev.center.x - pos.left - 150;
        let y = ev.center.y - pos.top - 150;

        LocalVariables.joystickX = Math.min(Math.max(x, -100), 100) / 100;
        LocalVariables.joystickY = (Math.min(Math.max(y, -100), 100) / 100) * -1;

        var coords = calculateCoords(ev.angle, ev.distance);

        psp.x = coords.x;
        psp.y = coords.y;

        psp.alpha = 0.5;

        stage.update();
    });

    mc.on("panend", function (ev) {
        clearInterval(LocalVariables.joystickIntervalCache);
        psp.alpha = 0.25;
        createjs.Tween.get(psp).to({ x: xCenter, y: yCenter }, 750, createjs.Ease.elasticOut);
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

function calculateCoords(angle, distance) {
    var coords = {};
    distance = Math.min(distance, 100);
    var rads = (angle * Math.PI) / 180.0;

    coords.x = distance * Math.cos(rads);
    coords.y = distance * Math.sin(rads);

    return coords;
}
