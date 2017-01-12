/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

// defaults
var defaults = {
  'showBackgroundColors': true,
  'grayClosedClasses': false,
  'hideClosedClasses': false,
  'hideCancelledClasses': true,
  'hideConflictingClasses': false,
  'hideStaffClasses': false
}

// form elements
var optionNames = [
  'showBackgroundColors',
  'grayClosedClasses',
  'hideClosedClasses',
  'hideCancelledClasses',
  'hideConflictingClasses',
  'hideStaffClasses'
];
var checkboxElems = {};
optionNames.forEach(function(name) {
  checkboxElems[name] = document.getElementById(name);
});

// load stored data
chrome.storage.sync.get(optionNames, function(options) {
  optionNames.forEach(function(name) {
    checkboxElems[name].checked = value(options[name], defaults[name]);
  });
});

// add event listeners
optionNames.forEach(function(name) {
  var elem = checkboxElems[name];
  elem.addEventListener('click', function() {
    var data = {};
    data[name] = elem.checked;
    chrome.storage.sync.set(data);
  });
});
document.getElementById('restoreDefaults')
  .addEventListener('click', function() {
    var data = {};
    optionNames.forEach(function(name) {
      checkboxElems[name].checked = data[name] = defaults[name];
    });
    chrome.storage.sync.set(data);
  });

// helper functions

function value(value, defaultValue) {
  return value === undefined || value === null ? defaultValue : value;
}
