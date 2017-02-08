/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

export function DNE(val) {
  return val === undefined || val === null
}

export function value(val, defaultVal) {
  return DNE(val) ? defaultVal : val
}
