window.appState = {
    activeTab: null,
    starInputs: {},
    starGrids: {},
    starModifiers: {},
    language: "en",
    persisted: false
};

// current language state
let translations = {};
let currentLang = "en";

async function loadLanguage(lang) {
  try {
    const res = await fetch(`/lang/${lang}.json`);
    translations = await res.json();   // only this language’s keys
    currentLang = lang;
    updateTranslations();
  } catch (err) {
    console.error("Error loading language file:", err);
  }
}


// core updater
function updateTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const translation = translations[key]; // flat lookup
    if (translation) {
      el.textContent = translation;
    }
  });
}

// called when dropdown changes
function changeLanguage() {
  const lang = document.getElementById("languageSelect").value;
  window.appState.language = lang;
  saveState();
  loadLanguage(lang);
}



function toggleVisibility(sectionId, buttonEl) {
    const section = document.getElementById(sectionId);
    if (!section || !buttonEl) return; // safety check

    const isHidden = section.style.display === "none" || section.style.display === "";

    // Toggle section visibility
    section.style.display = isHidden ? "block" : "none";

    // Update button text
    //buttonEl.textContent = isHidden ? "Hide Grid" : "Show Grid";

    // pick the right i18n key
    const key = isHidden
        ? "toggle-grid-view-label-show"
        : "toggle-grid-view-label-hide";
    buttonEl.setAttribute("data-i18n", key);


    // Update global state
    if (!window.appState) window.appState = {};        // ensure global exists
    if (!window.appState.starGrids) window.appState.starGrids = {}; // ensure sub-object exists

    window.appState.starGrids[sectionId] = isHidden;  // true = visible, false = hidden
    updateTranslations(buttonEl.parentNode);

    // Persist to localStorage
    saveState();
}



function saveState() {
    if (!window.appState.persisted) return;
    localStorage.setItem("appState", JSON.stringify(window.appState));
}

function loadState() {
    const savedState = localStorage.getItem("appState");
    if (savedState) {
        window.appState = JSON.parse(savedState);

        document.getElementById("rememberMe").checked = window.appState.persisted;
        currentLang = window.appState.language || "en";
        document.getElementById("languageSelect").value = currentLang;
        loadLanguage(currentLang)
        updateTranslations();
    }
}



function onRememberMeChange() {
    window.appState.persisted = document.getElementById("rememberMe").checked;
    if (window.appState.persisted) {
        saveState()
    }
    else {
        localStorage.clear();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".navButton");
    const sections = document.querySelectorAll("section");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            sections.forEach(sec => sec.classList.add("hidden"));
            const target = button.dataset.target;
            document.querySelector(`.${target}`).classList.remove("hidden");
            window.appState.activeTab = target;
            saveState();
        });
    });
});

// Run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    loadState();

    // Restore active tab if it exists
    if (window.appState.activeTab) {
        document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
        const section = document.querySelector(`.${window.appState.activeTab}`);
        if (section) section.classList.remove("hidden");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("appState");
    if (saved) {
        window.appState = JSON.parse(saved);

        if (window.appState.starGrids) {
            Object.entries(window.appState.starGrids).forEach(([id, visible]) => {
                const section = document.getElementById(id);
                const button = document.querySelector(`[onclick*="${id}"]`); // crude example, better to use data-target
                if (section) section.style.display = visible ? "block" : "none";
if (button) {
      // pick the right i18n key based on visibility
      const key = visible
        ? "toggle-grid-view-label-show"
        : "toggle-grid-view-label-hide";

      // set the attribute so your i18n system knows which string to inject
      button.setAttribute("data-i18n", key);

      // run your translation updater to actually apply the localized text
      updateTranslations(button.parentNode);
    }
                
            });
        }

    }
});




function convertNumberToNotation(number) {
  // Handle small numbers or Infinity
  if (Math.abs(number) < 1e9 || !isFinite(number)) {
    return number.toLocaleString(language);
  }

  const exponent = Math.floor(Math.log10(number));
  const mantissa = +(number / Math.pow(10, exponent)).toFixed(8);

  const notation =  "Normal"; //document.getElementById("inputNotation").value;
  switch (notation) {
    case "Original":
      return number.toLocaleString(language);

    case "Normal":
      return formatNormal(mantissa, exponent);

    case "Abstract":
      return formatAbstract(mantissa, exponent);

    case "Scientific":
      return `${mantissa.toPrecision(9)}e${exponent}`;

    default:
      return number.toLocaleString(language);
  }
}

// --- Helpers ---
function getLatinSuffix(index) {
  const units = ["", "U", "D", "T", "Q", "q", "S", "s", "O", "N"]; //["", "Un", "Duo", "Tre", "Quattuor", "Quinqua", "Se", "Septe", "Octo", "Nove"];
  const tens  = ["", "D", "V", "Tr", "QU", "qu", "Se", "Sp", "Oc", "No"]; //["", "Deci", "Viginti", "Triginta", "Quadraginta", "Quinquaginta", "Sexaginta", "Septuaginta", "Octoginta", "Nonaginta"];
  const hundreds = ["", "C", "Dc","Tc","Qr","Qg","Sc","Si","Oi","Ng"];//["", "Centi", "Ducenti", "Trecenti", "Quadringenti", "Quingenti", "Sescenti", "Septingenti", "Octingenti", "Nongenti"];

  const u = index % 10;
  const t = Math.floor(index / 10) % 10;
  const h = Math.floor(index / 100);

  return `${hundreds[h]}${tens[t]}${units[u]}`;
}

function formatNormal(mantissa, exponent) {
  mantissa *= Math.pow(10, exponent % 3);
  const index = Math.floor(exponent / 3) - 1;

  const normal1 = ["", "U", "D", "T", "Q", "q", "S", "s", "O", "N"];
  const normal10 = ["", "D", "V", "Tr", "QU", "qu", "Se", "Sp", "Oc", "No"];
  const normal100 = ["", "C", "Overflow"];

  const index1 = index % 10;
  const index10 = Math.floor(index % 100 / 10);
  const index100 = Math.floor(index % 1000 / 100);

  let suffix = getLatinSuffix(index);
  //switch (index % 100) {
  //  case 0: suffix = `${normal100[index100]}t`; break;
  //  case 1: suffix = `${normal100[index100]}M`; break;
  //  case 2: suffix = `${normal100[index100]}B`; break;
  //  default: suffix = `${normal100[index100]}${normal1[index1]}${normal10[index10]}`;
  //}

  return `${mantissa.toPrecision(9)} ${suffix}`;
}

function formatAbstract(mantissa, exponent) {
  mantissa *= Math.pow(10, exponent % 3);
  const index = Math.floor(exponent / 3) - 1;
  return `${mantissa.toPrecision(9)} ${convertIndexToAbstract(index)}`;
}

function convertIndexToAbstract(index) {
  if (index <= 0) return "";
  const remainder = (index - 1) % 26 + 1;
  return convertIndexToAbstract((index - remainder) / 26) + String.fromCharCode(96 + remainder);
}
