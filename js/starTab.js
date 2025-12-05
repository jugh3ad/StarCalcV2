function createStarCell(index, prefix) {
  const cell = document.createElement("div");
  cell.className = "star-cell";

  const img = document.createElement("img");
  img.src = "images/star.png";
  img.alt = `Star ${index}`;
  img.className = "star-icon";

  const input = document.createElement("input");
  input.type = "number";
  input.className = "star-input";
  input.id = `${prefix}-input-${index}`;
  input.min = 10;
  input.max = 99999;
  input.placeholder = "10";

  const minusBtn = document.createElement("button");
  minusBtn.className = "btn minus";
  minusBtn.textContent = "-";

  const plusBtn = document.createElement("button");
  plusBtn.className = "btn plus";
  plusBtn.textContent = "+";

  cell.append(img, input, minusBtn, plusBtn);
  return cell;
}

function buildStarGrid(containerId, rowDistribution, prefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // clear existing

  let starIndex = 1;
  rowDistribution.forEach(count => {
    const row = document.createElement("div");
    row.className = "star-row";

    for (let i = 0; i < count; i++) {
      row.appendChild(createStarCell(starIndex++, prefix));
    }

    container.appendChild(row);
  });
}

function attachInputListeners(selector) {
  const inputs = document.querySelectorAll(selector);
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      const val = parseInt(input.value, 10);
      const min = parseInt(input.min, 10);
      const max = parseInt(input.max, 10);

      if (!isNaN(val)) {
        if (val < min) input.value = min;
        if (val > max) input.value = max;
      }

      saveAllInputs(); // persist after manual change
    });
  });
}


// Build grid on page load
document.addEventListener("DOMContentLoaded", () => {
  // Current stars grid
  buildStarGrid("star-container-current", [2, 3, 3, 2], "current");

  // Target stars grid
  buildStarGrid("star-container-target", [2, 3, 3, 2], "target");
  // Stars
  attachInputListeners(".star-grid.current .star-input");
  attachInputListeners(".star-grid.target .star-input");

  // Modifiers
  attachInputListeners("#modifier-scrapyard, #modifier-achievements, #modifier-mastery");

});

