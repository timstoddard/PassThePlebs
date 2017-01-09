/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

// defaults
var SHOW_BACKGROUND_COLORS_DEFAULT = true;
var HIDE_CLOSED_CLASSES_DEFAULT = false;
var HIDE_CANCELLED_CLASSES_DEFAULT = true;
var HIDE_CONFLICTING_CLASSES_DEFAULT = false;

// form elements
var showBackgroundColorsElem = document.getElementById('showBackgroundColors');
var hideClosedClassesElem = document.getElementById('hideClosedClasses');
var hideCancelledClassesElem = document.getElementById('hideCancelledClasses');
var hideConflictingClassesElem = document.getElementById('hideConflictingClasses');
var restoreDefaultsButton = document.getElementById('restoreDefaults');

// load stored data
chrome.storage.sync.get([
  'showBackgroundColors',
  'hideClosedClasses',
  'hideCancelledClasses',
  'hideConflictingClasses'
], function (options) {
  showBackgroundColorsElem.checked = value(options['showBackgroundColors'], SHOW_BACKGROUND_COLORS_DEFAULT);
  hideClosedClassesElem.checked = value(options['hideClosedClasses'], HIDE_CLOSED_CLASSES_DEFAULT);
  hideCancelledClassesElem.checked = value(options['hideCancelledClasses'], HIDE_CANCELLED_CLASSES_DEFAULT);
  hideConflictingClassesElem.checked = value(options['hideConflictingClasses'], HIDE_CONFLICTING_CLASSES_DEFAULT);
});

// add event listeners
addOptionListener(showBackgroundColorsElem, 'showBackgroundColors');
addOptionListener(hideClosedClassesElem, 'hideClosedClasses');
addOptionListener(hideCancelledClassesElem, 'hideCancelledClasses');
addOptionListener(hideConflictingClassesElem, 'hideConflictingClasses');
restoreDefaultsButton.addEventListener('click', function () {
  showBackgroundColorsElem.checked = SHOW_BACKGROUND_COLORS_DEFAULT;
  hideClosedClassesElem.checked = HIDE_CLOSED_CLASSES_DEFAULT;
  hideCancelledClassesElem.checked = HIDE_CANCELLED_CLASSES_DEFAULT;
  hideConflictingClassesElem.checked = HIDE_CONFLICTING_CLASSES_DEFAULT;
  chrome.storage.sync.set({
    showBackgroundColors: showBackgroundColorsElem.checked,
    hideClosedClasses: hideClosedClassesElem.checked,
    hideCancelledClasses: hideCancelledClassesElem.checked,
    hideConflictingClasses: hideConflictingClassesElem.checked
  });
});

// helper functions
function addOptionListener(elem, name) {
  elem.addEventListener('click', function () {
    var data = {};
    data[name] = elem.checked;
    chrome.storage.sync.set(data);
  });
}

function value(value, defaultValue) {
  return value === undefined || value === null ? defaultValue : value;
}
