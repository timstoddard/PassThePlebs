/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

// defaults
var SHOW_BACKGROUND_COLORS_DEFAULT = true;
var GRAY_CLOSED_CLASSES_DEFAULT = false;
var HIDE_CLOSED_CLASSES_DEFAULT = false;
var HIDE_CANCELLED_CLASSES_DEFAULT = true;
var HIDE_CONFLICTING_CLASSES_DEFAULT = false;
var HIDE_STAFF_CLASSES_DEFAULT = false;

// form elements
var showBackgroundColorsElem = document.getElementById('showBackgroundColors');
var grayClosedClassesElem = document.getElementById('grayClosedClasses');
var hideClosedClassesElem = document.getElementById('hideClosedClasses');
var hideCancelledClassesElem = document.getElementById('hideCancelledClasses');
var hideConflictingClassesElem = document.getElementById('hideConflictingClasses');
var hideStaffClassesElem = document.getElementById('hideStaffClasses');
var restoreDefaultsButton = document.getElementById('restoreDefaults');

// load stored data
chrome.storage.sync.get([
  'showBackgroundColors',
  'grayClosedClasses',
  'hideClosedClasses',
  'hideCancelledClasses',
  'hideConflictingClasses',
  'hideStaffClasses'
], function(options) {
  showBackgroundColorsElem.checked = value(options['showBackgroundColors'], SHOW_BACKGROUND_COLORS_DEFAULT);
  grayClosedClassesElem.checked = value(options['grayClosedClasses'], GRAY_CLOSED_CLASSES_DEFAULT);
  hideClosedClassesElem.checked = value(options['hideClosedClasses'], HIDE_CLOSED_CLASSES_DEFAULT);
  hideCancelledClassesElem.checked = value(options['hideCancelledClasses'], HIDE_CANCELLED_CLASSES_DEFAULT);
  hideConflictingClassesElem.checked = value(options['hideConflictingClasses'], HIDE_CONFLICTING_CLASSES_DEFAULT);
  hideStaffClassesElem.checked = value(options['hideStaffClasses'], HIDE_STAFF_CLASSES_DEFAULT);
});

// add event listeners
addOptionListener(showBackgroundColorsElem, 'showBackgroundColors');
addOptionListener(grayClosedClassesElem, 'grayClosedClasses');
addOptionListener(hideClosedClassesElem, 'hideClosedClasses');
addOptionListener(hideCancelledClassesElem, 'hideCancelledClasses');
addOptionListener(hideConflictingClassesElem, 'hideConflictingClasses');
addOptionListener(hideStaffClassesElem, 'hideStaffClasses');
restoreDefaultsButton.addEventListener('click', function() {
  showBackgroundColorsElem.checked = SHOW_BACKGROUND_COLORS_DEFAULT;
  grayClosedClassesElem.checked = GRAY_CLOSED_CLASSES_DEFAULT;
  hideClosedClassesElem.checked = HIDE_CLOSED_CLASSES_DEFAULT;
  hideCancelledClassesElem.checked = HIDE_CANCELLED_CLASSES_DEFAULT;
  hideConflictingClassesElem.checked = HIDE_CONFLICTING_CLASSES_DEFAULT;
  hideStaffClassesElem.checked = HIDE_STAFF_CLASSES_DEFAULT;
  chrome.storage.sync.set({
    showBackgroundColors: showBackgroundColorsElem.checked,
    grayClosedClasses: grayClosedClassesElem.checked,
    hideClosedClasses: hideClosedClassesElem.checked,
    hideCancelledClasses: hideCancelledClassesElem.checked,
    hideConflictingClasses: hideConflictingClassesElem.checked,
    hideStaffClassesElem: hideStaffClassesElem.checked
  });
});

// helper functions
function addOptionListener(elem, name) {
  elem.addEventListener('click', function() {
    var data = {};
    data[name] = elem.checked;
    chrome.storage.sync.set(data);
  });
}

function value(value, defaultValue) {
  return value === undefined || value === null ? defaultValue : value;
}
