// Constants
const localStoragePrefix = 'velux.'
const projectIDKey = 'projectID'
const roomNameKey = 'roomName'
const projectViewKey = 'projectView'
const settingsProjectViewKey = 'settingsProjectView'
const roomOptionKey = 'roomOption'
const daylightSliderKey = 'daylightSliderValue'
const screenshotKey = 'screenshot'
const mouseControlSchemeKey = 'hoveringMouse'


function setup() {
	setupPlayButton();
    setupToggleMenuButton();
	setTimeout(function () { activateDefaultSettings(); }, 50);
	setupSlider();
}

function startStream() {
	// Wait for the connection to establish - ToDo: React to a proper event or let the Unreal Application send one
	setTimeout(function(){
		// Read html attribute 'ProjectID'
		const roomName = getURLParameter(roomNameKey);
		console.log(`roomName: ${roomName}`)
		if (roomName !== null) sendToStreamer(roomNameKey, roomName);
	},350);
}

function sendToStreamer(key, value) {
	let descriptor = {
		[key]: value
	};
	emitUIInteraction(descriptor);
	console.log(`Message to streamer: ${key} = ${value}`)
}

function setupPlayButton (){
	let videoPlayOverlay = document.getElementById('videoPlayOverlay');
	videoPlayOverlay.addEventListener('click', function onOverlayClick(event) {
		startStream();
	});
}

function setupToggleMenuButton (){
    let toggleMenuButton = document.getElementById('button-toogle-menu');
    toggleMenuButton.addEventListener('click', function onOverlayClick(event) {
        console.log('toggle menu');
        toggleMenu();
    });
}

function setupSlider () {
	var slider = document.getElementById("sliderDaylight");
	var output = document.getElementById("daylightValue");
	output.innerHTML = 0; // Display the default slider value

	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
        let tod = new Date(0,0,0,0,0,0,0);
        tod.setTime(tod.getTime() + (this.value*60000)); // Add slider value in milliseconds
        
        output.innerHTML = tod.getHours() + ":" + ("00" + tod.getMinutes()).substr(-2);
        sendToStreamer(daylightSliderKey, (this.value/1440).toFixed(2));
	}
}

function toggleMenu() {
    let menu = document.getElementById('lowerMenu');
    menu.classList.toggle('menu-hidden');
    menu.classList.toggle('menu-visible');
}

function activateDefaultSettings () {
	// Set match viewport resolution to true
	setRadioButtonState('match-viewport-res-tgl', true);

	// Set the control scheme to Hovering Mouse
	setRadioButtonState('control-tgl', true);

	// Fake mouse with touches
	setFakeMouseWithTouches(true);
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
