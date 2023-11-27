// Constants
export const daylightHeadingKey = "daylight-heading-climate-";
export const ventilationHeadingKey = "ventilation-heading-climate-";
export const daylightTextKey = "daylight-text-climate-";
export const ventilationTextKey = "ventilation-text-climate-";

export const daylightPercentageKey = "daylight-percentage-text-climate-";
export const ventilationPercentageKey = "ventilation-percentage-text-climate-";

export const airRenewalTimeKey = "ventilation-minutes-text-climate";

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
    console.log(`Detected locale: ${locale}`);

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

    locale = newLocale;
    await fetchTranslationsFile(locale);

    translatePage();
}

async function fetchTranslationsFile(newLocale) {
    const response = await fetch(`../languages/${newLocale}.json`);
    translations = await response.json();

    return;
}

function translatePage() {
    document.querySelectorAll("[localization-key]").forEach(translateElement);
}

function translateElement(element) {
    const key = element.getAttribute("localization-key");
    if (!(key in translations)) {
        console.error(`Translation for ${key} not found`);
        return;
    }

    const translation = translations[key];
    element.innerText = translation;
}

export async function getTranslation(key, ...parameters) {
    if (translations === undefined || Object.keys(translations).length === 0) {
        console.warn("No translations loaded yet, loading file for current locale");
        await fetchTranslationsFile(locale);
    }

    if (!(key in translations)) {
        console.error(`Translation for ${key} not found`);
    }

    // Replace parameters in translation, denoted by {{0}}, {{1}}, ...
    let translation = translations[key];
    parameters.forEach((parameter, index) => {
        translation = translation.replace(`{{${index}}}`, parameter);
    });

    return translation;
}

function tagElementsForLocalization() {
    let videoPlayOverlay = document.getElementById("playButton");
    videoPlayOverlay.setAttribute("localization-key", "video-play-overlay");
}
