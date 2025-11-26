// Apply translations (already defined earlier)
function applyTranslations(translations) {
  Object.keys(translations).forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      el.textContent = translations[key];
    }
  });
}

// Listen for language changes
document.getElementById('languageSelect').addEventListener('change', (e) => {
  const lang = e.target.value;
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => applyTranslations(data))
    .catch(err => console.error("Translation load error:", err));
});

// checkbox.js
import { savePositionData, loadPositionData } from './storageController.js';

export function initCheckbox(positionData) {
  const saveCheckbox = document.getElementById('saveToLocalStorage');

  // Restore checkbox state
  const saveEnabled = localStorage.getItem('saveEnabled');
  if (saveEnabled === 'true') {
    saveCheckbox.checked = true;
    loadPositionData(positionData);
  }

  // Listen for changes
  saveCheckbox.addEventListener('change', () => {
    if (saveCheckbox.checked) {
      localStorage.setItem('saveEnabled', 'true');
      savePositionData(positionData);
    } else {
      localStorage.setItem('saveEnabled', 'false');
      localStorage.removeItem('positionData');
    }
  });
}
