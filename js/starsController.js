// starsController.js
const StarsController = (() => {
    // --- Global state ---
window.starsState = window.starsState || {
  current: { single: null, grid: [], activeView: 'single' },
  target: { single: null, grid: [], activeView: 'single' },
  modifiers: {}
};


  // --- Helper to refresh state ---
function updateStarsState() {
  const state = {
    current: { single: null, grid: [] },
    target: { single: null, grid: [] },
    modifiers: {}
  };

  const currentSection = document.querySelector('.star-section.current');
  if (currentSection) {
    const single = currentSection.querySelector('.stars-view.active .star-input');
    if (single) state.current.single = parseInt(single.value, 10);
    currentSection.querySelectorAll('.star-grid .star-input')
      .forEach(inp => state.current.grid.push(parseInt(inp.value, 10)));
  }

  const targetSection = document.querySelector('.star-section.target');
  if (targetSection) {
    const single = targetSection.querySelector('.stars-view.active .star-input');
    if (single) state.target.single = parseInt(single.value, 10);
    targetSection.querySelectorAll('.star-grid .star-input')
      .forEach(inp => state.target.grid.push(parseInt(inp.value, 10)));
  }

  document.querySelectorAll('.modifier-container').forEach(container => {
    const label = container.querySelector('.modifier-label')?.textContent.trim();
    const value = parseInt(container.querySelector('.modifier-input')?.value, 10);
    if (label) state.modifiers[label] = value;
  });

  window.starsState = state;

  // Persist to localStorage
  localStorage.setItem('starsState', JSON.stringify(state));
  document.dispatchEvent(new Event('starsStateUpdated'));

}
 
    // Attach increment/decrement logic to a star or modifier
  function wireStarControls(container, isSingle = false) {
    const input = container.querySelector('.star-input, .modifier-input');
    const minusBtn = container.querySelector('.star-btn.minus');
    const plusBtn = container.querySelector('.star-btn.plus');

    if (!input || !minusBtn || !plusBtn) return;

    input.addEventListener('focus', () => input.select());

    minusBtn.addEventListener('click', () => {
      input.value = Math.max(parseInt(input.value || input.min, 10) - 1, input.min);
      if (isSingle) syncSectionValues(container.closest('.star-section'), input.value);
      updateStarsState();

    });

    plusBtn.addEventListener('click', () => {
      input.value = Math.min(parseInt(input.value || input.min, 10) + 1, input.max);
      if (isSingle) syncSectionValues(container.closest('.star-section'), input.value);
      updateStarsState();

    });

    input.addEventListener('input', () => {
      if (isSingle) syncSectionValues(container.closest('.star-section'), input.value);
      updateStarsState();

    });
  }

  // Sync all inputs in a section to the single star value
  function syncSectionValues(section, value) {
    section.querySelectorAll('.star-grid .star-input').forEach(inp => {
      inp.value = value;
    });
  }

  // Build grid dynamically
  const pattern = [2, 3, 3, 2];
  function buildGrid(container, minValue = 0) {
    container.innerHTML = '';
    pattern.forEach(count => {
      const row = document.createElement('div');
      row.classList.add('row');

      for (let i = 0; i < count; i++) {
        const starContainer = document.createElement('div');
        starContainer.classList.add('star-container');

        const img = document.createElement('img');
        img.src = 'images/star.png';
        img.classList.add('star-icon');

        const input = document.createElement('input');
        input.type = 'number';
        input.classList.add('star-input');
        input.min = minValue;
        input.max = 99999;

        const minusBtn = document.createElement('button');
        minusBtn.classList.add('star-btn', 'minus');
        minusBtn.textContent = '−';

        const plusBtn = document.createElement('button');
        plusBtn.classList.add('star-btn', 'plus');
        plusBtn.textContent = '+';

        starContainer.append(img, input, minusBtn, plusBtn);
        row.appendChild(starContainer);

        wireStarControls(starContainer, false);
      }

      container.appendChild(row);
    });
  }

  // Bulk adjust helper
  function adjustSectionValues(section, step) {
    section.querySelectorAll('.star-grid .star-input').forEach(inp => {
      const currentVal = parseInt(inp.value || inp.min, 10);
      const newVal = currentVal + step;
      inp.value = Math.min(Math.max(newVal, inp.min), inp.max);
    });
  }

  let starsInitialized = false;

  // Public init
  function init() {
      if (starsInitialized) return;
  starsInitialized = true;



    
    // modifiers
    document.querySelectorAll('.modifier-container')
      .forEach(container => wireStarControls(container, false));

    // grids
    document.querySelectorAll('.star-section.current .star-grid')
      .forEach(grid => buildGrid(grid, 10));
    document.querySelectorAll('.star-section.target .star-grid')
      .forEach(grid => buildGrid(grid, 10));

    // sections
    document.querySelectorAll('.star-section').forEach(section => {
      const singleStar = section.querySelector('.stars-view.active .star-container');
      if (singleStar) wireStarControls(singleStar, true);

      // bulk buttons
      section.querySelectorAll('.bulk-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const step = parseInt(btn.dataset.step, 10);
          adjustSectionValues(section, step);
          updateStarsState();
        });
      });

      // toggle
      const toggleBtn = section.querySelector('.toggle-stars');
      const views = section.querySelectorAll('.stars-view');
      toggleBtn.addEventListener('click', () => {
        //views.forEach(view => view.classList.toggle('active'));
      });
    });

    
// Restore from localStorage if available
const savedRaw = localStorage.getItem('starsState');
console.log("Raw starsState from localStorage:", savedRaw);

const saved = JSON.parse(savedRaw || '{}');
console.log("Parsed starsState object:", saved);
  const currentSingle = document.querySelector('.star-section.current .stars-view:first-of-type .star-input');
  const currentGrid = document.querySelectorAll('.star-section.current .stars-view:nth-of-type(2) .star-grid .star-input');

    if (saved.current) {
      // Restore current single
      const currentSingle = document.querySelector('.star-section.current .stars-view:first-of-type .star-input');
      if (currentSingle && saved.current.single !== null && saved.current.single !== undefined) {
        currentSingle.value = saved.current.single;
      }

      // Restore current grid
      const currentGrid = document.querySelectorAll('.star-section.current .stars-view:nth-of-type(2) .star-grid .star-input');
      saved.current.grid?.forEach((val, i) => {
        if (currentGrid[i] && val !== null && val !== undefined) {
          currentGrid[i].value = val;
        }
      });

      // Restore active view
      if (saved.current.activeView) {
        restoreActiveView('current', saved.current.activeView);
      }
    }


  const targetSingle = document.querySelector('.star-section.target .stars-view:first-of-type .star-input');
  const targetGrid = document.querySelectorAll('.star-section.target .stars-view:nth-of-type(2) .star-grid .star-input');


    if (saved.target) {
      // Restore target single
      const targetSingle = document.querySelector('.star-section.target .stars-view:first-of-type .star-input');
      if (targetSingle && saved.target.single !== null && saved.target.single !== undefined) {
        targetSingle.value = saved.target.single;
      }

      // Restore target grid
      const targetGrid = document.querySelectorAll('.star-section.target .stars-view:nth-of-type(2) .star-grid .star-input');
      saved.target.grid?.forEach((val, i) => {
        if (targetGrid[i] && val !== null && val !== undefined) {
          targetGrid[i].value = val;
        }
      });

      // Restore active view
      if (saved.target.activeView) {
        restoreActiveView('target', saved.target.activeView);
      }
    }


if (saved.modifiers) {
  console.log("Restoring modifiers:", saved.modifiers);

  document.querySelectorAll('.modifier-container').forEach(container => {
    const label = container.querySelector('.modifier-label')?.textContent.trim();
    if (label && saved.modifiers[label] !== undefined) {
      console.log(`Modifier ${label} =`, saved.modifiers[label]);
      const input = container.querySelector('.modifier-input');
      if (input) input.value = saved.modifiers[label];
    }
  });
}
// Hook into toggle buttons
function toggleView(section) {
  const views = document.querySelectorAll(`.star-section.${section} .stars-view`);
  const singleView = views[0];
  const gridView = views[1];

  const isGridActive = gridView.classList.contains('active');

  // Clear both
  singleView.classList.remove('active');
  gridView.classList.remove('active');

  if (isGridActive) {
    // Switch to single
    singleView.classList.add('active');
    window.starsState[section].activeView = 'single';
  } else {
    // Switch to grid
    gridView.classList.add('active');
    window.starsState[section].activeView = 'grid';
  }

  localStorage.setItem('starsState', JSON.stringify(window.starsState));
  console.log(`${section} activeView saved:`, window.starsState[section].activeView);
}

// Hook up buttons
document.getElementById('currentStarToggle').addEventListener('click', () => toggleView('current'));
document.getElementById('targetStarToggle').addEventListener('click', () => toggleView('target'));





updateStarsState();
document.dispatchEvent(new Event('starsStateUpdated'));

  }

  return { init };
})();

window.StarsController = StarsController;

// starsController.js
document.addEventListener('DOMContentLoaded', () => {
  StarsController.init();
});


// Helpers
function saveActiveView(section, viewType) {
  if (!window.starsState[section]) window.starsState[section] = {};
  window.starsState[section].activeView = viewType; // "single" or "grid"
  localStorage.setItem('starsState', JSON.stringify(window.starsState));
}

function restoreActiveView(section, savedView) {
  const views = document.querySelectorAll(`.star-section.${section} .stars-view`);
  views.forEach(view => view.classList.remove('active'));

  if (savedView === 'grid') {
    views[1]?.classList.add('active'); // second stars-view is grid
  } else {
    views[0]?.classList.add('active'); // first stars-view is single
  }
}


