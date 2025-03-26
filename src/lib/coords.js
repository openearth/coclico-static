/**
 * Round the coordinates of a point to a given precision.
 * Defaults to precision of 3.
 * @param coord
 * @param precision
 * @returns {*}
 */
export function roundCoord(coord, precision = 3) {
  return Number(coord).toFixed(precision);
}
