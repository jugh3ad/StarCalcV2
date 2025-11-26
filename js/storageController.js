// storage.js
export function savePositionData(positionData) {
  localStorage.setItem('positionData', JSON.stringify(positionData));
}

export function loadPositionData(positionData) {
  const stored = localStorage.getItem('positionData');
  if (stored) {
    Object.assign(positionData, JSON.parse(stored));
  }
  return positionData;
}
