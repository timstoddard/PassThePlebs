(function () {
  var showBackgroundColorsElem = document.getElementById('showBackgroundColors');
  var showCancelledClassesElem = document.getElementById('showCancelledClasses');
  chrome.storage.sync.get([
    'showBackgroundColors',
    'showCancelledClasses'
  ], function (options) {
    showBackgroundColorsElem.checked = value(options['showBackgroundColors'], true);
    showCancelledClassesElem.checked = value(options['showCancelledClasses'], false);
  });

  showBackgroundColorsElem.addEventListener('click', function () {
    chrome.storage.sync.set({
      showBackgroundColors: showBackgroundColorsElem.checked
    });
  });
  showCancelledClassesElem.addEventListener('click', function () {
    chrome.storage.sync.set({
      showCancelledClasses: showCancelledClassesElem.checked
    });
  });

  function value(value, defaultValue) {
    return value === undefined || value === null ? defaultValue : value;
  }
} ());
