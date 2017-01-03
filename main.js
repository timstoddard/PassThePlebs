(function() {
  var nameGroups = {};

  $('.select-course table tbody tr .sectionNumber').each(function () {
    var nameElem = $(this).next().next().next();
    var rawName = nameElem[0].innerText;
    if (rawName !== 'STAFF') {
      if (nameGroups[rawName]) {
        nameGroups[rawName].push(nameElem);
      } else {
        nameGroups[rawName] = [nameElem];
      }
    }
  });

  for (var rawName in nameGroups) {
    getPolyratingData(nameGroups[rawName]);
  }

  function getPolyratingData(nameElems) {
    var names = nameElems[0][0].innerText.split(',');
    var lastName = removeAllSingleLetters(names[0].trim());
    var firstName = onlyFirstName(removeAllSingleLetters(names[1].trim()));
    var name = firstName + ' ' + lastName;
    console.log(name);
    getDataAndUpdatePage(nameElems, name, lastName, true);
  }

  function getDataAndUpdatePage(nameElems, name, lastName, firstAttempt) {
    chrome.runtime.sendMessage(
      {
        method: 'GET',
        action: 'xhttp',
        url: 'http://polyratings.com/search.php?type=ProfName&terms=' + (firstAttempt ? name.replace(/ /g, '+') : lastName) + '&format=long&sort=name',
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
            var bgColor = calculateBgRGBA(numericalRating);
            nameElems.forEach(function(nameElem) {
              nameElem.css('background', bgColor);
              nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '<br><span class="rating">' + rating + '</span> (' + evals + ')</a>');
            });
            return;
          } catch (e) { }
        }
        if (firstAttempt) {
          getDataAndUpdatePage(nameElems, name, lastName, false);
        } else {
          addLinkToSearchPage(nameElems, lastName);
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

  function addLinkToSearchPage(nameElems, lastName) {
    var href = 'http://polyratings.com/search.php?type=ProfName&terms=' + lastName + '&format=long&sort=name';
    nameElems.forEach(function(nameElem) {
      nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '</a>');
    });
  }
}());
