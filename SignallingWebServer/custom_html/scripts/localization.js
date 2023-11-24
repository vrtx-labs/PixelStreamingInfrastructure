// Constants
const daylightHeadingLevelCount = 5;
const daylightHeadingKey = "daylight-heading-climate";
const ventilationHeadingKey = "ventilation-heading-climate";

const daylightTextLevelCount = 5;
const daylightTextKey = "daylight-text-climate";
const ventilationTextKey = "ventilation-text-climate";

const daylightPercentageLevelCount = 3;
const daylightPercentageKey = "daylight-percentage-text-climate";
const ventilationPercentageKey = "ventilation-percentage-text-climate";

const airRenewalTimeKey = "ventilation-minutes-text-climate";

export const SupportedLocales = {
    english: "en",
    german: "de",
    //french: "fr",
    //swiss: "ch",
    //danish: "dk",
};

export const SupportedLocalesList = Object.values(SupportedLocales);

const defaultLocale = "en";
let locale;
let translations = {}; // Gets filled with active locale translations

export function initialize() {
    // Translate the page to the default locale
    tagElementsForLocalization();
    translateUsingLocale(getLocaleFromBrowser());
}

function getLocaleFromBrowser() {
    // ToDo Do we need to make this smarter?
    const language = navigator.language;
    const locale = language.split("-")[0];

    return locale;
}

// Load translations for the given locale and translate
// the page to this locale
async function translateUsingLocale(newLocale) {
    if (newLocale === undefined) newLocale = defaultLocale;
    if (newLocale === locale) return;
    if (!SupportedLocalesList.includes(newLocale)) {
        console.error(`Locale ${newLocale} is not supported`);
        return;
    }

    const newTranslations = await fetchTranslationsFor(newLocale);
    locale = newLocale;
    translations = newTranslations;
    translatePage();
}

async function fetchTranslationsFor(newLocale) {
    const response = await fetch(`../languages/${newLocale}.json`);

    return await response.json();
}

function translatePage() {
    document.querySelectorAll("[localization-key]").forEach(translateElement);
}

function translateElement(element) {
    const key = element.getAttribute("localization-key");
    const translation = translations[key];
    element.innerText = translation;
}

export function getTranslation(key) {
    return translations[key];
}

function tagElementsForLocalization() {
    let videoPlayOverlay = document.getElementById("playButton");
    videoPlayOverlay.setAttribute("localization-key", "video-play-overlay");
}
