(function () {
  var showBackgroundColorsElem = document.getElementById('showBackgroundColors');
  var hideClosedClassesElem = document.getElementById('hideClosedClasses');
  var hideCancelledClassesElem = document.getElementById('hideCancelledClasses');
  var hideConflictingClassesElem = document.getElementById('hideConflictingClasses');
  var restoreDefaultsButton = document.getElementById('restoreDefaults');
  chrome.storage.sync.get([
    'showBackgroundColors',
    'hideClosedClasses',
    'hideCancelledClasses',
    'hideConflictingClasses'
  ], function (options) {
    showBackgroundColorsElem.checked = value(options['showBackgroundColors'], true);
    hideClosedClassesElem.checked = value(options['hideClosedClasses'], false);
    hideCancelledClassesElem.checked = value(options['hideCancelledClasses'], true);
    hideConflictingClassesElem.checked = value(options['hideConflictingClasses'], false);
  });

  showBackgroundColorsElem.addEventListener('click', function () {
    chrome.storage.sync.set({ showBackgroundColors: showBackgroundColorsElem.checked });
  });
  hideClosedClassesElem.addEventListener('click', function () {
    chrome.storage.sync.set({ hideClosedClasses: hideClosedClassesElem.checked });
  });
  hideCancelledClassesElem.addEventListener('click', function () {
    chrome.storage.sync.set({ hideCancelledClasses: hideCancelledClassesElem.checked });
  });
  hideConflictingClassesElem.addEventListener('click', function () {
    chrome.storage.sync.set({ hideConflictingClasses: hideConflictingClassesElem.checked });
  });
  restoreDefaultsButton.addEventListener('click', function () {
    chrome.storage.sync.set({
      showBackgroundColors: true,
      hideClosedClasses: false,
      hideCancelledClasses: true,
      hideConflictingClasses: false
    });
    showBackgroundColorsElem.checked = true;
    hideClosedClassesElem.checked = false;
    hideCancelledClassesElem.checked = true;
    hideConflictingClassesElem.checked = false;
  });

  function value(value, defaultValue) {
    return value === undefined || value === null ? defaultValue : value;
  }
} ());
