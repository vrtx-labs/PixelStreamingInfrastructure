// Constants
export const SupportedLocales = {
    english: "en",
    german: "de",
    french: "fr",
    swiss: "ch",
    danish: "dk",
};

export const SupportedLocalesList = Object.values(SupportedLocales);

const defaultLocale = "en";
let locale;
let translations = {}; // Gets filled with active locale translations

// Subscribe to the page loaded event
document.addEventListener("DOMContentLoaded", () => {
    // Translate the page to the default locale
    translateUsingLocale(defaultLocale);
});

// Load translations for the given locale and translate
// the page to this locale
async function translateUsingLocale(newLocale) {
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
