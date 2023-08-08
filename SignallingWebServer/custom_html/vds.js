// Constants
const projectIDKey = 'ProjectID'
const localStoragePrefix = 'velux.'

const projectViewKey = 'ProjectView'
const settingsProjectViewKey = 'SettingsProjectView'
const roomOptionKey = 'RoomOption'
const daylightSliderKey = 'DaylightSliderValue'
const screenshotKey = 'Screenshot'

function setup() {
	// Get URL parameter
	parseURL();
	setupPlayButton();
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
	console.log(`Message to streamer: ${key}: ${value}`)
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
