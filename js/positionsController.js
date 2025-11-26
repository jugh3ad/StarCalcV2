
import { initCheckbox } from './optionsController.js';


const positionButtons = document.querySelectorAll('.positions-btn');

const positionData = {
    goldenscrap: {
        current: Array(20).fill(0),
        target: Array(20).fill(0),
        lockedCurrent: Array(20).fill(false),
        lockedTarget: Array(20).fill(false)
    },
    starfragment: {
        current: Array(20).fill(0),
        target: Array(20).fill(0),
        lockedCurrent: Array(20).fill(false),
        lockedTarget: Array(20).fill(false)
    },
    masterytoken: {
        current: Array(20).fill(0),
        target: Array(20).fill(0),
        lockedCurrent: Array(20).fill(false),
        lockedTarget: Array(20).fill(false)
    },
    magnet: {
        current: Array(20).fill(0),
        target: Array(20).fill(0),
        lockedCurrent: Array(20).fill(false),
        lockedTarget: Array(20).fill(false)
    },
    wrench: {
        current: Array(20).fill(0),
        target: Array(20).fill(0),
        lockedCurrent: Array(20).fill(false),
        lockedTarget: Array(20).fill(false)
    }
};

// Initialize checkbox with dataset
initCheckbox(positionData);

positionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle active state
        positionButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Which dataset?
        const key = btn.id.replace('pos', '').toLowerCase();

        // Load current values into grid
        const currentInputs = document.querySelectorAll('#currentPositionGrid .position-input');
        positionData[key].current.forEach((val, i) => {
            currentInputs[i].value = val; // use stored values
        });

        // Load target values into grid
        const targetInputs = document.querySelectorAll('#targetPositionGrid .position-input');
        positionData[key].target.forEach((val, i) => {
            targetInputs[i].value = val;
        });
        // Restore current grid locks
        positionData[key].lockedCurrent.forEach((isLocked, i) => {
            const cell = document.querySelector(`#currentPositionGridCell${i + 1}`);
            const lockBtn = cell.querySelector('.lock-btn');
            const overlay = cell.querySelector('.lock-overlay');

            if (isLocked) {
                cell.classList.add('locked');
                lockBtn.textContent = "🔒";
                overlay.style.display = "block";
            } else {
                cell.classList.remove('locked');
                lockBtn.textContent = "🔓";
                overlay.style.display = "none";
            }
        });

        // Restore target grid locks
        positionData[key].lockedTarget.forEach((isLocked, i) => {
            const cell = document.querySelector(`#targetPositionGridCell${i + 1}`);
            const lockBtn = cell.querySelector('.lock-btn');
            const overlay = cell.querySelector('.lock-overlay');

            if (isLocked) {
                cell.classList.add('locked');
                lockBtn.textContent = "🔒";
                overlay.style.display = "block";
            } else {
                cell.classList.remove('locked');
                lockBtn.textContent = "🔓";
                overlay.style.display = "none";
            }
        });
    });
});

function updateDataset(gridId, index, newValue) {
    const activeBtn = document.querySelector('.positions-btn.active');
    if (!activeBtn) return;
    const key = keyMap[activeBtn.id];

    if (gridId === 'currentPositionGrid') {
        positionData[key].current[index] = newValue;
    } else {
        positionData[key].target[index] = newValue;
    }
    if (document.getElementById('saveToLocalStorage').checked) {
        localStorage.setItem('positionData', JSON.stringify(positionData));
    }

    // 🔹 Auto‑save if checkbox is enabled
    if (document.getElementById('saveToLocalStorage').checked) {
        savePositionData();
    }
}



function createGrid(gridId) {
    const grid = document.getElementById(gridId);
    for (let i = 1; i <= 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'position-cell';
        cell.id = `${gridId}Cell${i}`;

        const img = document.createElement('img');
        img.src = "images/barrelBackground.png";
        img.alt = "Barrel";
        img.className = "position-img";

        const lockBtn = document.createElement('button');
        lockBtn.className = "lock-btn";
        lockBtn.textContent = "🔓";

        const overlay = document.createElement('div');
        overlay.className = "lock-overlay";

        const input = document.createElement('input');
        input.type = "number";
        input.className = "position-input";
        input.min = "0";
        input.max = "99999";
        input.value = "0";

        const controls = document.createElement('div');
        controls.className = "position-controls";

        const minusBtn = document.createElement('button');
        minusBtn.className = "position-btn minus";
        minusBtn.textContent = "−";

        const plusBtn = document.createElement('button');
        plusBtn.className = "position-btn plus";
        plusBtn.textContent = "+";

        controls.appendChild(minusBtn);
        controls.appendChild(plusBtn);

        cell.appendChild(img);
        cell.appendChild(lockBtn);
        cell.appendChild(overlay);
        cell.appendChild(input);
        cell.appendChild(controls);

        grid.appendChild(cell);

        // 🔹 Attach hold increment logic
        attachHoldIncrement(minusBtn, input, cell, gridId, i - 1, -1);
        attachHoldIncrement(plusBtn, input, cell, gridId, i - 1, +1);

        // 🔹 Attach input listener here
        input.addEventListener('input', () => {
            updateDataset(gridId, i - 1, parseInt(input.value) || 0);
            adjustFontSize(input);
        });

        // Lock toggle
        lockBtn.addEventListener('click', () => {
            cell.classList.toggle('locked');
            const activeBtn = document.querySelector('.positions-btn.active');
            if (activeBtn) {
                const key = activeBtn.id.replace('pos', '').toLowerCase();
                if (gridId === 'currentPositionGrid') {
                    positionData[key].lockedCurrent[i - 1] = cell.classList.contains('locked');
                } else {
                    positionData[key].lockedTarget[i - 1] = cell.classList.contains('locked');
                }
            }

            if (cell.classList.contains('locked')) {
                lockBtn.textContent = "🔒";
                overlay.style.display = "block";
            } else {
                lockBtn.textContent = "🔓";
                overlay.style.display = "none";
            }
            if (document.getElementById('saveToLocalStorage').checked) {
                localStorage.setItem('positionData', JSON.stringify(positionData));
            }

        });


    }
}


createGrid('currentPositionGrid');
createGrid('targetPositionGrid');

function adjustFontSize(input) {
    const length = input.value.length;

    if (length <= 2) {
        input.style.fontSize = "2rem";   // normal size
    } else if (length <= 4) {
        input.style.fontSize = "1.5rem"; // shrink a bit
    } else {
        input.style.fontSize = "1rem";  // shrink more
    }
}

// Attach to all position inputs
document.querySelectorAll('.position-input').forEach(input => {
    input.addEventListener('input', () => adjustFontSize(input));
});




function attachHoldIncrement(btn, input, cell, gridId, index, direction) {
    let interval;
    let speed = 300;   // start faster (300ms instead of 400)
    let minSpeed = 30; // allow very fast repeats
    let stepCount = 0;

    const step = () => {
        if (!cell.classList.contains('locked')) {
            let newVal = parseInt(input.value) + direction;
            newVal = Math.max(parseInt(input.min), Math.min(newVal, parseInt(input.max)));
            input.value = newVal;
            updateDataset(gridId, index, newVal);
        }
        stepCount++;
        // ramp up: every 5 steps, reduce interval speed
        if (stepCount % 5 === 0 && speed > minSpeed) {
            clearInterval(interval);
            speed = Math.max(minSpeed, speed - 50); // accelerate faster
            interval = setInterval(step, speed);
        }
    };

    btn.addEventListener('mousedown', () => {
        stepCount = 0;
        speed = 300;
        step();
        interval = setInterval(step, speed);
    });

    btn.addEventListener('mouseup', () => clearInterval(interval));
    btn.addEventListener('mouseleave', () => clearInterval(interval));

    // Mobile support
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        stepCount = 0;
        speed = 300;
        step();
        interval = setInterval(step, speed);
    });
    btn.addEventListener('touchend', () => clearInterval(interval));
}

function savePositionData() {
    localStorage.setItem('positionData', JSON.stringify(positionData));
}

function loadPositionData() {
    const stored = localStorage.getItem('positionData');
    if (stored) {
        Object.assign(positionData, JSON.parse(stored));
    }
}

saveCheckbox.addEventListener('change', () => {
    if (saveCheckbox.checked) {
        savePositionData();
    } else {
        localStorage.removeItem('positionData');
    }
});

const PositionsController = (() => {
  function init() {
    // tab-specific setup
  }
  return { init };
})();
window.PositionsController = PositionsController;
