(function () {
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

  // TODO: add option to hide cancelled classes
  // $('.key-cancel').each(function() {
  //   $(this).hide();
  // });

  for (var rawName in nameGroups) {
    getPolyratingData(nameGroups[rawName]);
  }

  function getPolyratingData(nameElems) {
    var rawName = nameElems[0][0].innerText;
    chrome.storage.local.get(rawName, function (data) {
      if (Object.keys(data).length > 0) {
        var info = JSON.parse(data[rawName]);
        if ((Date.now() - info.timeAdded) / (1000 * 60) < 10) {
          updateInstructorName(rawName, nameElems, info.bgColor, info.href, info.rating, info.evals);
        }
      } else {
        var names = rawName.split(',');
        var lastName = removeAllSingleLetters(names[0].trim());
        var firstNames = removeAllSingleLetters(names[1].trim());
        var firstName = onlyFirstName(firstNames);
        var name1 = urlFormat(firstNames + ' ' + lastName);
        var name2 = urlFormat(firstName + ' ' + lastName);
        var namesList = [lastName, urlFormat(firstNames), name1];
        if (name2 !== name1) {
          namesList.push(firstName);
          namesList.push(name2);
        }
        getDataAndUpdatePage(nameElems, rawName, namesList);
      }
    });
  }

  function getDataAndUpdatePage(nameElems, rawName, namesList) {
    var nextName = namesList.pop();
    chrome.runtime.sendMessage(
      {
        method: 'GET',
        action: 'xhttp',
        url: 'http://polyratings.com/search.php?type=ProfName&terms=' + nextName + '&format=long&sort=name',
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
            updateInstructorName(rawName, nameElems, bgColor, href, rating, evals);
            return;
          } catch (e) { }
        }
        if (namesList.length > 0) {
          getDataAndUpdatePage(nameElems, rawName, namesList);
        } else {
          addLinkToSearchPage(nameElems, nextName);
        }
      }
    );
  }

  function updateInstructorName(rawName, nameElems, bgColor, href, rating, evals) {
    nameElems.forEach(function (nameElem) {
      nameElem.css('background', bgColor);
      nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '<br><span class="rating">' + rating + '</span> (' + evals + ')</a>');
    });
    var info = {
      bgColor: bgColor,
      href: href,
      rating: rating,
      evals: evals,
      timeAdded: Date.now()
    };
    var data = {};
    data[rawName] = JSON.stringify(info);
    chrome.storage.local.set(data);
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

  function urlFormat(str) {
    return str.replace(/ /g, '+');
  }

  function calculateBgRGBA(rating) {
    var r = rating < 3 ? 255 : 255 * (4 - rating) / 4;
    var g = rating < 3 ? 255 * rating / 3 : 255;
    return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',0,0.6)';
  }

  function addLinkToSearchPage(nameElems, lastName) {
    var href = 'http://polyratings.com/search.php?type=ProfName&terms=' + lastName + '&format=long&sort=name';
    nameElems.forEach(function (nameElem) {
      nameElem.html('<a href="' + href + '" target="_blank" class="ratingLink">' + nameElem.html() + '</a>');
    });
  }
} ());
