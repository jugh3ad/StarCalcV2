import { runStarCalculations } from './starCalc.js';

document.addEventListener('DOMContentLoaded', () => {
    // Element selectors
    const navButtons = document.querySelectorAll('.navButton');
    const panels = document.querySelectorAll('.tab-content .tab-pane');
    const inputs = document.querySelectorAll('input');
    const bulkInputs = document.querySelectorAll('.bulk-buttons .btn');
    const starButtons = document.querySelectorAll('.star-grid .btn.plus, .star-grid .btn.minus');
    const modifierButtons = document.querySelectorAll('.star-modifiers .btn.plus, .star-modifiers .btn.minus');
    const setStars = document.querySelectorAll('#set-stars-current, #set-stars-target');
    let currentLocale = "en-US"; // default


    restoreAllInputs(); //restore values first


    function saveAllInputs() {
        const data = {
            language: localStorage.getItem("selectedLanguage") || "en",
            inputs: {}
        };

        document.querySelectorAll("input").forEach(input => {
            if (input.id) {
                data.inputs[input.id] = input.value; // ✅ store inside inputs object
            }
        });

        localStorage.setItem("starCalculatorInputs", JSON.stringify(data));
        runStarCalculations(data); // Recalculate after saving
        formatNumbers();
    }

    function restoreAllInputs() {
        const saved = localStorage.getItem("starCalculatorInputs");
        const savedLang = localStorage.getItem("selectedLanguage") || "en";

        // ✅ set dropdown to saved language
        const langSelect = document.getElementById("languageSelect");
        if (langSelect) {
            langSelect.value = savedLang;
        }
        // Restore language
        setLanguage(savedLang); // calls your i18n loader

        if (!saved) return;
        const data = JSON.parse(saved);

        // Restore inputs
        if (data.inputs) {
            Object.keys(data.inputs).forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.value = data.inputs[id];
                }
            });
        }
        runStarCalculations(data); // Recalculate after restoring
        formatNumbers();
    }


    function setLanguage(langCode) {
        fetch(`lang/${langCode}.json`)
            .then(res => res.json())
            .then(data => {
                applyTranslations(data);
                if (data.locale) {
                    currentLocale = data.locale; // ✅ update locale
                }
                saveAllInputs(); // persist language + inputs
                formatNumbers(); // ✅ reformat numbers after language change
            });
    }

    function applyTranslations(langData) {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });
    }


    document.getElementById("languageSelect").addEventListener("change", (e) => {
        const lang = e.target.value;
        localStorage.setItem("selectedLanguage", lang); // ✅ persist language separately
        setLanguage(lang);
        saveAllInputs(); // persist inputs + language together
    });

    function formatNumbers() {
        const formatter = new Intl.NumberFormat(currentLocale, {
            style: "decimal",
            maximumFractionDigits: 0
        });

        const gsAmount = getNumericValue(document.getElementById("gsCost"), 10) || 0;
        const magAmount = getNumericValue(document.getElementById("magnetCost"), 10) || 0;
        const fragmentAmount = getNumericValue(document.getElementById("fragmentCost"), 10) || 0;

        document.getElementById("gsCost").innerText = formatter.format(gsAmount);
        document.getElementById("magnetCost").innerText = formatter.format(magAmount);
        document.getElementById("fragmentCost").innerText = formatter.format(fragmentAmount);
    }

    function getNumericValue(el) {
        return parseInt(el.innerText.replace(/[^\d]/g, ""), 10) || 0;
    }



    // Tab navigation
    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            panels[index].classList.add('active');
        });
    });

    // Default active tab
    navButtons[0].classList.add('active');
    panels[0].classList.add('active');


    // Select all text on focus for inputs
    inputs.forEach(input => {
        input.addEventListener("focus", function () {
            this.select();
        });
        input.setAttribute("tabindex", "0"); // Ensure inputs are focusable
    });


    // Change single value with bounds checking    
    function changeValue(input, delta) {
        // If input is null or missing, bail out safely
        if (!input) return;

        // Normalize empty or invalid values to 0
        let current = parseInt(input.value, 10);
        if (isNaN(current)) current = 0;

        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || 99999;

        const newValue = current + delta;
        if (newValue >= min && newValue <= max) {
            input.value = newValue;
        } else if (newValue < min) {
            input.value = min; // clamp to min
        } else if (newValue > max) {
            input.value = max; // clamp to max
        }
        saveAllInputs();

    }


    // Accelerated press handler
    function holdButton(btn, delta) {
        let timeout;
        let speed = 300;       // initial delay
        const step = 50;       // acceleration step
        const minSpeed = 50;   // cap at 50ms

        const input = btn.parentElement.querySelector("input");
        if (!input) return;

        // Recursive function for accelerated hold
        function repeat() {
            changeValue(input, delta);
            speed = Math.max(minSpeed, speed - step); // decrease speed but cap at minSpeed
            timeout = setTimeout(repeat, speed);
        }

        // Hold down
        btn.addEventListener("pointerdown", () => {
            changeValue(input, delta); // immediate response
            speed = 300;               // reset starting speed
            timeout = setTimeout(repeat, speed);
        });

        // Stop when released or mouse leaves
        ["pointerup", "pointerleave", "pointercancel"].forEach(evt => {
            btn.addEventListener(evt, () => {
                clearTimeout(timeout);
                speed = 300; // reset speed
            });
        });
    }

    // Attach to all starButtons
    starButtons.forEach(button => {
        const delta = button.classList.contains("plus") ? +1 : -1;
        holdButton(button, delta);

        // optional: prevent tab focus if you want
        button.setAttribute("tabindex", "-1");
    });

    // Attach to all modifierButtons
    modifierButtons.forEach(button => {
        const delta = button.classList.contains("plus") ? +1 : -1;
        holdButton(button, delta);

        // optional: prevent tab focus if you want
        button.setAttribute("tabindex", "-1");
    });


    // Bulk change function
    function bulkChange(button, step) {
        const starInputs = button.closest('.star-grid').querySelectorAll('.star-input');

        starInputs.forEach(input => {
            let currentValue = parseInt(input.value, 10) || 0;
            const min = parseInt(input.min) || 0;
            const max = parseInt(input.max) || 99999;

            const newValue = currentValue + step;
            if (newValue >= min && newValue <= max) {
                input.value = newValue;
            } else if (newValue < min) {
                input.value = min;
            } else if (newValue > max) {
                input.value = max;
            }
            saveAllInputs();
        });
    }

    function holdBulkButton(btn, step) {
        let timeout;
        let speed = 300;       // initial delay
        const stepAccel = 50;  // acceleration step
        const minSpeed = 50;   // cap at 50ms

        // Recursive accelerated hold
        function repeat() {
            bulkChange(btn, step);
            speed = Math.max(minSpeed, speed - stepAccel);
            timeout = setTimeout(repeat, speed);
        }

        // Unified press (mouse/touch/stylus)
        btn.addEventListener("pointerdown", () => {
            bulkChange(btn, step); // immediate response
            speed = 300;
            timeout = setTimeout(repeat, speed);
        });

        // Unified release
        ["pointerup", "pointerleave", "pointercancel"].forEach(evt => {
            btn.addEventListener(evt, () => {
                clearTimeout(timeout);
                speed = 300;
            });
        });
    }

    // Attach to all bulk buttons
    bulkInputs.forEach(button => {
        const step = parseInt(button.getAttribute("data-step"), 10);
        holdBulkButton(button, step);
    });

    //set bulk star values
function applyBulkValue(gridSelector, value) {
  const starInputs = document.querySelectorAll(`${gridSelector} .star-input`);
  starInputs.forEach(starInput => {
    const min = parseInt(starInput.min, 10);
    const max = parseInt(starInput.max, 10);
    if (value >= min && value <= max) {
      starInput.value = value;
    }
  });
}

setStars.forEach(input => {
  input.addEventListener('change', () => {
    const value = parseInt(input.value, 10) || 0;
    if (input.id.includes('current')) {
      applyBulkValue('.star-grid.current', value);
    } else {
      applyBulkValue('.star-grid.target', value);
    }
    saveAllInputs();
  });
});

});