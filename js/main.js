(function () {
  var nameGroups = {};
  var showBackgroundColors;

  $('.select-course table thead tr').each(function () {
    var headers = $(this).children();
    var input = $('<input type="checkbox" style="margin-left:4px">');
    input.click(function () {
      var checked = this.checked;
      var table = $(this).parent().parent().parent().parent();
      table.find('tbody tr td input[type="checkbox"]').each(function () {
        this.checked = !checked;
        $(this).click();
      });
    });
    $(headers[0]).append(input);
    $(headers[4]).after('<th>Polyrating</th>');
  });

  $('td input[type="checkbox"]').each(function () {
    var input = $(this);
    input.removeClass('left');
    input.parent().css('text-align', 'center');
  });

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

  chrome.storage.sync.get([
    'showBackgroundColors',
    'hideClosedClasses',
    'hideCancelledClasses',
    'hideConflictingClasses'
  ], function (options) {
    if (options['hideClosedClasses']) {
      $('tr.key-closed').each(hideClassRow);
    }
    if (options['hideCancelledClasses']) {
      $('tr.key-cancel').each(hideClassRow);
    }
    if (options['hideConflictingClasses']) {
      $('tr.key-avail').each(hideClassRow);
    }
    showBackgroundColors = DNE(options.showBackgroundColors)
      ? true
      : options.showBackgroundColors;
    for (var rawName in nameGroups) {
      getPolyratingData(nameGroups[rawName]);
    }
  });

  function hideClassRow() {
    var row = $(this);
    row.hide();
    var rowAbove = row.prev();
    var sectionNotes = rowAbove.find('td .section-notes');
    if (sectionNotes[0]) {
      rowAbove.hide();
    }
  }

  function getPolyratingData(nameElems) {
    var rawName = nameElems[0][0].innerText;
    chrome.storage.local.get(rawName, function (data) {
      if (Object.keys(data).length > 0) {
        var info = JSON.parse(data[rawName]);
        if ((Date.now() - info.timeAdded) / (1000 * 60) < 10) {
          updateInstructorName(rawName, nameElems, info.bgColor, info.href, info.rating, info.evals);
        } else {
          generateNameCombos(nameElems, rawName);
        }
      } else {
        generateNameCombos(nameElems, rawName);
      }
    });
  }

  function generateNameCombos(nameElems, rawName) {
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
        if (response !== 'error') {
          try {
            var polyratingPage = $($.parseHTML(response));
            var ratingElem = polyratingPage.find('.hidden-xs span .text-primary');
            var rating = ratingElem[0].innerText;
            var profId = response.match(/profid=(\d+)/)[1];
            var evals = ratingElem.next()[0].innerText.replace('uation', '');
            var href = 'http://polyratings.com/eval.php?profid=' + profId;
            var numericalRating = parseFloat(rating, 10);
            var bgColor = calculateBackgroundColor(numericalRating);
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
      var anchor = '<a href="' + href + '" target="_blank" class="ratingLink">';
      nameElem.html(anchor + nameElem.html() + '</a>');
      nameElem.after('<td>' + anchor + '<span class="rating">' + rating + '</span><br>' + evals + '</a></td>');
      if (showBackgroundColors) {
        var css = {
          'background': 'white',
          'background-image': 'linear-gradient(' + bgColor + ',' + bgColor + ')'
        };
        nameElem.css(css);
        nameElem.next().css(css);
      }
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

  function DNE(value) {
    return value === undefined || value === null;
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

  function calculateBackgroundColor(rating) {
    var r = rating < 3 ? 255 : 255 * (4 - rating) / 4;
    var g = rating < 3 ? 255 * rating / 3 : 255;
    return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',0,0.7)';
  }

  function addLinkToSearchPage(nameElems, lastName) {
    var href = 'http://polyratings.com/search.php?type=ProfName&terms=' + lastName + '&format=long&sort=name';
    nameElems.forEach(function (nameElem) {
      var anchor = '<a href="' + href + '" target="_blank" class="ratingLink">';
      nameElem.html(anchor + nameElem.html() + '</a>');
      nameElem.after('<td style="text-align:center">' + anchor + 'n/a</a></td>');
    });
  }
} ());
