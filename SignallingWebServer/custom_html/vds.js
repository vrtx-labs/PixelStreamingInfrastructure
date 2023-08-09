// Constants
const localStoragePrefix = 'velux.'
const projectIDKey = 'ProjectID'
const projectViewKey = 'ProjectView'
const settingsProjectViewKey = 'SettingsProjectView'
const roomOptionKey = 'RoomOption'
const daylightSliderKey = 'DaylightSliderValue'
const screenshotKey = 'Screenshot'

function setup() {
	// Get URL parameter
	parseURL();
	setupPlayButton();
	setTimeout(function(){ activateDefaultSettings(); }, 50);
	//setupSlider ();
}

function startStream() {
	// Wait for the connection to establish - ToDo: React to a proper event or let the Unreal Application send one
	setTimeout(function(){
		const activeScene = window.localStorageGet = (projectIDKey);
		sendToStreamer(projectIDKey, activeScene);
	},350);
}

function sendToStreamer(key, value) {
	let descriptor = {
		[key]: value
	};
	emitUIInteraction(descriptor);
	console.log(`Message to streamer: ${descriptor}`)
}

function parseURL() {
	// Read html attribute 'ProjectID'
    const parsedUrl = new URL(window.location.href)
    const projectID = parsedUrl.searchParams.get(projectIDKey) ? parsedUrl.searchParams.get(projectIDKey) : null

	console.log(`ProjectID: ${projectID}`)
	if (projectID === null) return;
	localStorageSet (projectIDKey, projectID);
}

function setupPlayButton (){
	let videoPlayOverlay = document.getElementById('videoPlayOverlay');
	videoPlayOverlay.addEventListener('click', function onOverlayClick(event) {
		startStream();
	});
}

function activateDefaultSettings () {
	// Set match viewport resolution to true
	toggleRadioButton('match-viewport-res-tgl');

	// Set the control scheme to Hovering Mouse
	toggleRadioButton('control-tgl');
}

function toggleRadioButton (id) {
	let radioButton = document.getElementById(id);
	if (radioButton === null) return;

	// Manually change the state of the button
	radioButton.checked = !radioButton.checked;

	// Create a new event and dispatch it
	if ("createEvent" in document) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("change", false, true);
    radioButton.dispatchEvent(evt);
	}
	else radioButton.onchange();
}

function localStorageSet (localStorageKey, localStorageValue)
{
	window.localStorage.setItem(localStoragePrefix + localStorageKey, JSON.stringify(localStorageValue))
}

function localStorageGet (localStorageKey)
{
	JSON.parse(window.localStorage.getItem(localStoragePrefix + localStorageKey))
}

/*
function setupSlider () {
	var slider = document.getElementById("slider");
	var output = document.getElementById("slider-value");
	output.innerHTML = slider.value; // Display the default slider value

	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
	  output.innerHTML = this.value;
	  sendToStreamer(sliderKeyToStreamer, this.value);
	}
}
*/
