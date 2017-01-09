/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

(function () {
  var nameGroups = {};
  var showBackgroundColors;
  var hideStaffClasses;

  chrome.storage.sync.get([
    'showBackgroundColors',
    'hideClosedClasses',
    'hideCancelledClasses',
    'hideConflictingClasses',
    'hideStaffClasses'
  ], function (options) {
    hideRows(options, 'hideClosedClasses', 'tr.key-closed', false);
    hideRows(options, 'hideCancelledClasses', 'tr.key-cancel', true);
    hideRows(options, 'hideConflictingClasses', 'tr.key-avail', false);
    showBackgroundColors = DNE(options.showBackgroundColors)
      ? true
      : options.showBackgroundColors;
    hideStaffClasses = DNE(options.hideStaffClasses)
      ? false
      : options.hideStaffClasses;

    // make an array of all the instructor names and associated <td> elements
    $('.select-course > table > tbody > tr > .sectionNumber').each(function () {
      var nameElem = $(this).next().next().next();
      var rawName = nameElem[0].innerText;
      if (rawName !== 'STAFF') {
        if (nameGroups[rawName]) {
          nameGroups[rawName].push(nameElem);
        } else {
          nameGroups[rawName] = [nameElem];
        }
      } else {
        foundStaff(nameElem);
      }
    });

    // integrate polyrating data and improve the layout
    for (var rawName in nameGroups) {
      getPolyratingData(nameGroups[rawName]);
    }
    fixPassLayout();
  });

  function fixPassLayout() {
    // move errors to the left side
    var errors = $('#error').detach();
    errors.appendTo('.sidebar');

    // add select all checkboxes
    $('.select-course > table > thead > tr').each(function () {
      var headers = $(this).children();
      var input = $('<input class="selectAll" type="checkbox" style="margin-left:4px">');
      input.click(function () {
        var checked = this.checked;
        var table = $(this).parent().parent().parent().parent();
        table.find('tbody > tr > td > input[type="checkbox"]').each(function () {
          this.checked = !checked;
          $(this).click();
        });
      });
      $(headers[0]).append(input);
      $(headers[4]).after('<th>Polyrating</th>');
    });

    // update the select all checkboxes to checked if all their children all checked
    $('.selectAll').each(function () {
      var table = $(this).parent().parent().parent().parent();
      var allChecked = true;
      table.find('tbody > tr > td > input[type="checkbox"]').each(function () {
        allChecked &= this.checked;
      });
      this.checked = allChecked;
    });

    // restyle the checkboxes
    $('td > input[type="checkbox"]').each(function () {
      var input = $(this);
      input.removeClass('left');
      input.parent().css('text-align', 'center');
    });

    // listen for child checkbox changes to update its select all checkbox
    $('td > input[type="checkbox"]:not(.selectAll)').click(function () {
      var table = $(this).parent().parent().parent().parent();
      var allChecked = true;
      table.find('tbody > tr > td > input[type="checkbox"]').each(function () {
        allChecked &= this.checked;
      });
      var selectAll = table.find('.selectAll');
      selectAll[0].checked = allChecked;
    });

    // add catalog link to section headers
    $('.select-course > h3').each(function () {
      var header = $(this);
      var headerContent = $(header.contents()[0]);
      var headerText = headerContent.text().replace(/\s+/g, ' ').trim();
      var course = headerText
        .match(/([a-z]+ \d+)/i)[0]
        .replace(' ', '+');
      headerContent.wrap('<a href="http://catalog.calpoly.edu/search/?P=' + course + '" target="_blank" class="headerLink"></a>');
      headerContent.replaceWith('<span class="headerText">' + headerText + '</span>');
    });
  }

  function hideRows(options, name, selector, defaultValue) {
    if (options[name]) {
      $(selector).each(hideClassRow);
    } else if (DNE(options[name])) {
      if (defaultValue) {
        $(selector).each(hideClassRow);
      }
      var data = {};
      data[name] = defaultValue;
      chrome.storage.sync.set(data);
    }
  }

  function hideClassRow() {
    var row = $(this);
    row.hide();
    var rowAbove = row.prev();
    var sectionNotes = rowAbove.find('td > .section-notes');
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
    var firstNamesList = firstNames.split(' ');
    var namesList = [];
    firstNamesList.forEach(function(name) {
      namesList.push(urlFormat(name + ' ' + lastName));
    });
    var fullName = urlFormat(firstNames + ' ' + lastName);
    if (namesList.indexOf(fullName) === -1) {
      namesList.push(fullName);
    }
    namesList.unshift(lastName, firstNamesList[0]);
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
            var ratingElem = polyratingPage.find('.hidden-xs > span > .text-primary');
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
      updateAttachedRows(nameElem);
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
      updateAttachedRows(nameElem);
    });
  }

  function foundStaff(nameElem) {
    if (hideStaffClasses) {
      // hide row
      var row = nameElem.parent();
      row.hide();
      // hide row above (section notes)
      var rowAbove = row.prev();
      var sectionNotes = rowAbove.find('td > .section-notes');
      if (sectionNotes[0]) {
        rowAbove.hide();
      }
      // hide row(s) below (if any)
      row = row.next();
      var colSpanTd = row.find('td:first-child[colspan]')[0];
      while (colSpanTd) {
        row.hide();
        row = row.next();
        colSpanTd = row.find('td:first-child[colspan]')[0];
      }
    } else {
      nameElem.after('<td style="text-align:center">n/a</td>');
      updateAttachedRows(nameElem);
    }
  }

  function updateAttachedRows(nameElem) {
    var nextRow = nameElem.parent().next();
    var colSpanTd = nextRow.find('td:first-child[colspan]')[0];
    while (colSpanTd) {
      colSpanTd.colSpan += 1;
      nextRow = nextRow.next();
      colSpanTd = nextRow.find('td:first-child[colspan]')[0];
    }
  }
} ());
