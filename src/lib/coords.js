/**
 * Round the coordinates of a point to a given precision.
 * Defaults to precision of 3.
 * @param coord
 * @param precision
 * @returns {*}
 */
export function roundCoord(coord, precision = 3) {
  if (!coord) return null;
  return Number(coord).toFixed(precision);
}

/**
 * Format coordinates for display.
 * @param coords
 * @param precision
 * @returns {string|null}
 */
export function formatCoords(coords, precision = 3) {
  if (!coords?.lat || !coords?.lng) return null;
  return `(${roundCoord(coords.lat, precision)}, ${roundCoord(coords.lng, precision)})`;
}
