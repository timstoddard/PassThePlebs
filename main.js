$('.select-course table tbody tr .sectionNumber').each(function () {
  var nameElem = $(this).next().next().next();
  getPolyratingData(nameElem);
});

function getPolyratingData(nameElem) {
  if (nameElem[0].innerText === 'STAFF') {
    return;
  }
  var names = nameElem[0].innerText.split(',');
  var lastName = removeAllSingleLetters(names[0].trim());
  var firstName = onlyFirstName(removeAllSingleLetters(names[1].trim()));
  var name = firstName + ' ' + lastName;
  chrome.runtime.sendMessage(
    {
      method: 'GET',
      action: 'xhttp',
      url: 'http://polyratings.com/search.php?type=ProfName&terms=' + name.replace(/ /g, '+') + '&format=long&sort=name',
      data: '',
    },
    function (response) {
      if (response != 'error') {
        try {
          var polyratingPage = $($.parseHTML(response));
          var ratingElem = polyratingPage.find('.hidden-xs span .text-primary');
          var rating = ratingElem[0].innerText;
          var evals = ratingElem.next()[0].innerText.replace('uation', '');
          var profId = response.match(/profid=(\d+)/)[1];
          var href = 'http://polyratings.com/eval.php?profid=' + profId;
          var numericalRating = parseFloat(rating, 10);
          nameElem.css('background', calculateBgRGBA(numericalRating));
          nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '<br><span class="rating">' + rating + '</span> (' + evals + ')</a>');

        } catch (e) {
          getPolyratingData2ndAttempt(nameElem, lastName);
        }
      } else {
        getPolyratingData2ndAttempt(nameElem, lastName);
      }
    }
  );
}

function getPolyratingData2ndAttempt(nameElem, lastName) {
  chrome.runtime.sendMessage(
    {
      method: 'GET',
      action: 'xhttp',
      url: 'http://polyratings.com/search.php?type=ProfName&terms=' + lastName + '&format=long&sort=name',
      data: '',
    },
    function (response) {
      if (response != 'error') {
        try {
          var polyratingPage = $($.parseHTML(response));
          var ratingElem = polyratingPage.find('.hidden-xs span .text-primary');
          var rating = ratingElem[0].innerText;
          var profId = response.match(/profid=(\d+)/)[1];
          var evals = ratingElem.next()[0].innerText.replace('uation', '');
          var href = 'http://polyratings.com/eval.php?profid=' + profId;
          var numericalRating = parseFloat(rating, 10);
          nameElem.css('background', calculateBgRGBA(numericalRating));
          nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '<br><span class="rating">' + rating + '</span> (' + evals + ')</a>');
        } catch (e) {
          addLinkToSearchPage(nameElem, lastName);
        }
      } else {
        addLinkToSearchPage(nameElem, lastName);
      }
    }
  );
}

function onlyFirstName(name) {
  var spaceIndex = name.indexOf(' ');
  return spaceIndex > -1 ? name.substr(0, spaceIndex) : name;
}

function removeAllSingleLetters(name) {
  var modified = '';
  var parts = name.split(' ');
  parts.forEach(function (part) {
    if (/[a-z]{2,}/.test(part)) {
      modified += ' ' + part;
    }
  });
  return modified.trim();
}

function calculateBgRGBA(rating) {
  var r = rating < 3 ? 255 : 255 * (4 - rating) / 4;
  var g = rating < 3 ? 255 * rating / 3 : 255;
  return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',0,0.6)';
}

function addLinkToSearchPage(nameElem, lastName) {
  var href = 'http://polyratings.com/search.php?type=ProfName&terms=' + lastName + '&format=long&sort=name';
  nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '</a>');
}
