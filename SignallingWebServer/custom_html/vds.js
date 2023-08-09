// Constants
const localStoragePrefix = 'velux.'
const projectIDKey = 'projectID'
const projectViewKey = 'projectView'
const settingsProjectViewKey = 'settingsProjectView'
const roomOptionKey = 'roomOption'
const daylightSliderKey = 'daylightSliderValue'
const screenshotKey = 'screenshot'
const mouseControlSchemeKey = 'hoveringMouse'


function setup() {
	setFakeMouseWithTouches(true);
	setupPlayButton();
	setTimeout(function () { activateDefaultSettings(); }, 50);
	//setupSlider();
}

function startStream() {
	// Wait for the connection to establish - ToDo: React to a proper event or let the Unreal Application send one
	setTimeout(function(){
		// Read html attribute 'ProjectID'
		const projectID = getURLParameter(projectIDKey);
		console.log(`ProjectID: ${projectID}`)
		if (projectID !== null) sendToStreamer(projectIDKey, projectID);
	},350);
}

function sendToStreamer(key, value) {
	let descriptor = {
		[key]: value
	};
	emitUIInteraction(descriptor);
	console.log(`Message to streamer: ${descriptor}`)
}

function setupPlayButton (){
	let videoPlayOverlay = document.getElementById('videoPlayOverlay');
	videoPlayOverlay.addEventListener('click', function onOverlayClick(event) {
		startStream();
	});
}

function activateDefaultSettings () {
	// Set match viewport resolution to true
	setRadioButtonState('match-viewport-res-tgl', true);

	// Set the control scheme to Hovering Mouse
	setRadioButtonState('control-tgl', true);
}

function setRadioButtonState(id, state) {
	let radioButton = document.getElementById(id);
	if (radioButton === null || radioButton.checked == state) return;

	// Manually change the state of the button
	radioButton.checked = state;

	// Create a new event and dispatch it
	var event = new Event('change', {});
	radioButton.dispatchEvent(event);
}

function getURLParameter(parameter) {
	const parsedUrl = new URL(window.location.href)
	const projectID = parsedUrl.searchParams.has(projectIDKey) ? parsedUrl.searchParams.get(projectIDKey) : null

	return projectID;
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
