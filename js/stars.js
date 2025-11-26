
// StarCalc V2 — combined logic (tabs, grid builder, accelerated +/- hold)
// Pure HTML/CSS/JS, no build tools.

// --- View toggle ---
document.addEventListener('DOMContentLoaded', () => {
    const starSections = document.querySelectorAll('.star-section');

    starSections.forEach((section) => {
        const toggleBtn = section.querySelector('.toggle-stars');
        const views = section.querySelectorAll('.stars-view');

        if (!toggleBtn || views.length < 2) return;

        views.forEach((view, i) => { view.hidden = i !== 0; });
        toggleBtn.setAttribute('aria-expanded', 'false');

        const LABEL_GRID = 'Individual Stars';
        const LABEL_SINGLE = 'All Stars';
        toggleBtn.textContent = LABEL_GRID;

        toggleBtn.addEventListener('click', () => {
            const isGridHidden = views[1].hidden;
            views[0].hidden = isGridHidden;
            views[1].hidden = !isGridHidden;
            toggleBtn.setAttribute('aria-expanded', isGridHidden ? 'true' : 'false');
            toggleBtn.textContent = isGridHidden ? LABEL_SINGLE : LABEL_GRID;
        });
    });


    // --- Dynamic star grid builder ---
    const rowConfig = [2, 3, 3, 2];
    const minValue = 10;
    const maxValue = 99999;

    document.querySelectorAll('.star-grid').forEach((gridEl) => {
        buildGrid(gridEl, rowConfig, minValue, maxValue);
    });

    function buildGrid(gridEl, config, minValue, maxValue) {
        gridEl.innerHTML = '';

        config.forEach((starsInRow) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'row';

            for (let i = 0; i < starsInRow; i++) {
                const container = document.createElement('div');
                container.className = 'star-container';

                const img = document.createElement('img');
                img.src = 'images/star.png';
                img.className = 'star-icon';
                img.alt = 'Star';

                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'star-input';
                input.min = String(minValue);
                input.max = String(maxValue);

                const minusBtn = document.createElement('button');
                minusBtn.className = 'star-btn minus';
                minusBtn.textContent = '−';
                attachHoldBehavior(minusBtn, input, -1);

                const plusBtn = document.createElement('button');
                plusBtn.className = 'star-btn plus';
                plusBtn.textContent = '+';
                attachHoldBehavior(plusBtn, input, 1);

                container.append(img, input, minusBtn, plusBtn);
                rowEl.appendChild(container);
            }

            gridEl.appendChild(rowEl);
        });
    }
});


// --- Individual star +/- buttons with accelerated hold ---
document.querySelectorAll('.star-container').forEach(container => {
    const input = container.querySelector('.star-input');
    const minusBtn = container.querySelector('.minus');
    const plusBtn = container.querySelector('.plus');

    attachHoldBehavior(minusBtn, input, -1);
    attachHoldBehavior(plusBtn, input, 1);
});

// --- Single-view bulk +/- buttons with accelerated hold ---
document.addEventListener('DOMContentLoaded', () => {
  // Find all single-view bulk control groups
  document.querySelectorAll('.bulk-controls.single-bulk').forEach(controlGroup => {
    const container = controlGroup.closest('.stars-view').querySelector('.star-container');
    const input = container?.querySelector('.star-input');
    if (!input) return;

    controlGroup.querySelectorAll('.bulk-btn').forEach(btn => {
      const step = parseInt(btn.dataset.step, 10);
      if (Number.isNaN(step)) return;

      // Attach accelerated hold behavior for bulk buttons
      attachHoldBehavior(btn, input, step);
    });
  });
});

// --- Accelerated press-and-hold for +/- buttons ---
function attachHoldBehavior(button, input, step) {
    let holding = false;
    let timeoutId = null;

    const INITIAL_REPEAT_RATE = 300;   // ms between repeats at start
    const ACCEL_FACTOR = 0.85;         // shrink interval by 15% each tick
    const MIN_REPEAT_RATE = 50;        // fastest allowed

    let repeatRate = INITIAL_REPEAT_RATE;

    const repeat = () => {
        if (!holding) return;
        adjustValue(input, step);
        repeatRate = Math.max(MIN_REPEAT_RATE, repeatRate * ACCEL_FACTOR);
        timeoutId = setTimeout(repeat, repeatRate);
    };

    const startHold = () => {
        holding = true;
        adjustValue(input, step);        // immediate single step
        timeoutId = setTimeout(() => {
            repeatRate = INITIAL_REPEAT_RATE;
            repeat();
        }, 500);                         // delay before repeating
    };

    const stopHold = () => {
        holding = false;
        clearTimeout(timeoutId);
        timeoutId = null;
        repeatRate = INITIAL_REPEAT_RATE;
    };

    button.addEventListener('mousedown', startHold);
    button.addEventListener('mouseup', stopHold);
    button.addEventListener('mouseleave', stopHold);
    button.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(); }, { passive: false });
    button.addEventListener('touchend', stopHold);
    button.addEventListener('touchcancel', stopHold);
    button.addEventListener('contextmenu', stopHold);
}

// Clamp to min/max
function adjustValue(input, step) {
    const min = parseInt(input.min || '0', 10);
    const max = parseInt(input.max || '99999', 10);
    let val = parseInt(input.value || min, 10);
    if (Number.isNaN(val)) val = min;
    val = Math.min(max, Math.max(min, val + step));
    input.value = String(val);
}


// --- Bulk controls logic ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bulk-controls').forEach(controlGroup => {
        const buttons = controlGroup.querySelectorAll('.bulk-btn');
        const gridEl = controlGroup.closest('.stars-view').querySelector('.star-grid');

        buttons.forEach(btn => {
            const step = parseInt(btn.dataset.step, 10);
            if (Number.isNaN(step)) return;

            // Attach hold behavior for bulk buttons
            attachBulkHoldBehavior(btn, gridEl, step);
        });
    });
});

function attachBulkHoldBehavior(button, gridEl, step) {
    let holding = false;
    let timeoutId = null;

    const INITIAL_REPEAT_RATE = 300;
    const ACCEL_FACTOR = 0.85;
    const MIN_REPEAT_RATE = 50;
    let repeatRate = INITIAL_REPEAT_RATE;

    const repeat = () => {
        if (!holding) return;
        applyBulkStep(gridEl, step);
        repeatRate = Math.max(MIN_REPEAT_RATE, repeatRate * ACCEL_FACTOR);
        timeoutId = setTimeout(repeat, repeatRate);
    };

    const startHold = () => {
        holding = true;
        applyBulkStep(gridEl, step); // immediate
        timeoutId = setTimeout(() => {
            repeatRate = INITIAL_REPEAT_RATE;
            repeat();
        }, 500);
    };

    const stopHold = () => {
        holding = false;
        clearTimeout(timeoutId);
        timeoutId = null;
        repeatRate = INITIAL_REPEAT_RATE;
    };

    button.addEventListener('mousedown', startHold);
    button.addEventListener('mouseup', stopHold);
    button.addEventListener('mouseleave', stopHold);
    button.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(); }, { passive: false });
    button.addEventListener('touchend', stopHold);
    button.addEventListener('touchcancel', stopHold);
    button.addEventListener('contextmenu', stopHold);
}

function applyBulkStep(gridEl, step) {
    const inputs = gridEl.querySelectorAll('.star-input');
    inputs.forEach(input => {
        adjustValue(input, step);
    });
}
