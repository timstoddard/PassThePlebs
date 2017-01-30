/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

export function DNE(value) {
  return value === undefined || value === null
}

export function value(value, defaultValue) {
  return DNE(value) ? defaultValue : value
}
