
// indexController.js

// ==============================
// Cache DOM elements
// ==============================
const buttons = document.querySelectorAll('header button[data-tab]');
const tabs = document.querySelectorAll('.tab');

// Track initialized tabs to avoid re-initialization
const initializedTabs = new Set();

// Default tab name
const DEFAULT_TAB = 'stars';

// ==============================
// Initialize default tab on page load
// ==============================
activateDefaultTab(DEFAULT_TAB);

// ==============================
// Helper Functions
// ==============================

/**
 * Activates the default tab and its button state.
 * @param {string} tabName - The name of the default tab.
 */
function activateDefaultTab(tabName) {
  const defaultTabElement = document.getElementById(tabName);
  if (defaultTabElement) {
    defaultTabElement.classList.add('active');
  }

  // Highlight the default button
  buttons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      setButtonActiveState(btn, true);
    }
  });

  // Initialize default tab controller
  initController(tabName);
}

/**
 * Handles tab activation when a button is clicked.
 * @param {string} tabName - The name of the tab to activate.
 * @param {HTMLElement} btn - The button that triggered the activation.
 */
function activateTab(tabName, btn) {
  // Hide currently active tab
  document.querySelector('.tab.active')?.classList.remove('active');

  // Show selected tab
  document.getElementById(tabName)?.classList.add('active');

  // Reset all button states
  buttons.forEach(button => setButtonActiveState(button, false));

  // Highlight clicked button
  setButtonActiveState(btn, true);

  // Initialize controller for this tab
  initController(tabName);
}

/**
 * Sets the active state for a button's icon and text wrappers.
 * @param {HTMLElement} btn - The button element.
 * @param {boolean} isActive - Whether to activate or deactivate.
 */
function setButtonActiveState(btn, isActive) {
  btn.querySelectorAll('.icon-wrapper, .text-wrapper')
    .forEach(wrapper => wrapper.classList.toggle('active', isActive));
}

/**
 * Initializes the controller for a given tab if not already initialized.
 * @param {string} tabName - The name of the tab.
 */
function initController(tabName) {
  const controllerName = `${capitalize(tabName)}Controller`;
  const controller = window[controllerName];

  if (controller?.init && !initializedTabs.has(tabName)) {
    controller.init();
    initializedTabs.add(tabName);
  }
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - Capitalized string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==============================
// Event Listeners
// ==============================
buttons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab, btn));
});

// Remove buttons from tab order for accessibility
document.querySelectorAll('button').forEach(btn => {
  btn.setAttribute('tabindex', '-1');
});
