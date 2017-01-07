(function () {
  var showBackgroundColorsElem = document.getElementById('showBackgroundColors');
  var hideCancelledClassesElem = document.getElementById('hideCancelledClasses');
  var hideConflictingClassesElem = document.getElementById('hideConflictingClasses');
  var restoreDefaultsButton = document.getElementById('restoreDefaults');
  chrome.storage.sync.get([
    'showBackgroundColors',
    'hideCancelledClasses',
    'hideConflictingClasses'
  ], function (options) {
    showBackgroundColorsElem.checked = value(options['showBackgroundColors'], true);
    hideCancelledClassesElem.checked = value(options['hideCancelledClasses'], false);
    hideConflictingClassesElem.checked = value(options['hideConflictingClasses'], false);
  });

  showBackgroundColorsElem.addEventListener('click', function () {
    chrome.storage.sync.set({ showBackgroundColors: showBackgroundColorsElem.checked });
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
      hideCancelledClasses: false,
      hideConflictingClasses: false
    });
    showBackgroundColorsElem.checked = true;
    hideCancelledClassesElem.checked = false;
    hideConflictingClassesElem.checked = false;
  });

  function value(value, defaultValue) {
    return value === undefined || value === null ? defaultValue : value;
  }
} ());
