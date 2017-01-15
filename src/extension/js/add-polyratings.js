/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

export class PolyratingIntegrator {
  showBackgroundColors;
  hideStaffClasses;

  constructor(showBackgroundColors, hideStaffClasses) {
    this.showBackgroundColors = showBackgroundColors;
    this.hideStaffClasses = hideStaffClasses;
  }

  addPolyratings() {
    let nameGroups = {};
    let rawNames = [];

    // make an object with all the instructor names and associated <td> elements
    $('.select-course > table > tbody > tr > .sectionNumber').each((i, elem) => {
      let nameElem = $(elem).next().next().next();
      let rawName = nameElem[0].innerText;
      if (rawName !== 'STAFF') {
        if (nameGroups[rawName]) {
          nameGroups[rawName].push(nameElem);
        } else {
          nameGroups[rawName] = [nameElem];
          rawNames.push(nameElem[0].innerText);
        }
      } else {
        this.foundStaff(nameElem);
      }
    });

    // loop over all instructor names and get the associated polyrating data
    chrome.storage.local.get(rawNames, (data) => {
      rawNames.forEach((rawName) => {
        let dataForName = data[rawName];
        let nameElems = nameGroups[rawName];
        if (dataForName) {
          let info = JSON.parse(dataForName);
          if ((Date.now() - info.timestamp) / (1000 * 60) < 10) {
            if (info.notFound || info.ambiguous) {
              this.addLinkToSearchPage(nameElems, rawName, info.lastName, info.notFound);
            } else {
              this.updateInstructorName(rawName, nameElems, info.bgColor, info.href, info.rating, info.evals);
            }
          } else {
            this.generateNameCombos(nameElems, rawName);
          }
        } else {
          this.generateNameCombos(nameElems, rawName);
        }
      })
    });
  }

  generateNameCombos(nameElems, rawName) {
    let names = rawName.split(',');
    let lastName = this.removeAllSingleLetters(names[0].trim());
    let firstNames = this.removeAllSingleLetters(names[1].trim());
    let firstNamesList = firstNames.split(' ');
    let namesList = [];
    firstNamesList.forEach((name) => {
      namesList.push(this.urlFormat(`${name} ${lastName}`));
    });
    let fullName = this.urlFormat(`${firstNames} ${lastName}`);
    if (namesList.indexOf(fullName) === -1) {
      namesList.push(fullName);
    }
    namesList.unshift(lastName);
    this.getDataAndUpdatePage(nameElems, rawName, namesList);
  }

  getDataAndUpdatePage(nameElems, rawName, namesList) {
    let nextName = namesList.pop();
    chrome.runtime.sendMessage(
      {
        method: 'GET',
        action: 'xhttp',
        url: `http://polyratings.com/search.php?type=ProfName&terms=${nextName}&format=long&sort=name`,
        data: '',
      },
      (response) => {
        if (response !== 'error') {
          try {
            let polyratingPage = $($.parseHTML(response));
            let ratingElem = polyratingPage.find('.hidden-xs > span > .text-primary');
            if (ratingElem[0]) {
              let rating = ratingElem[0].innerText;
              let profId = response.match(/profid=(\d+)/)[1];
              let evals = ratingElem.next()[0].innerText.replace('uation', '');
              let href = `http://polyratings.com/eval.php?profid=${profId}`;
              let numericalRating = parseFloat(rating, 10);
              let bgColor = this.calculateBackgroundColor(numericalRating);
              this.updateInstructorName(rawName, nameElems, bgColor, href, rating, evals);
              return;
            } else {
              let mainPageHeader = polyratingPage.find('h1.header-text');
              if (namesList.length === 0 && !mainPageHeader[0]) {
                // searched name exists, but there were multiple search results
                this.addLinkToSearchPage(nameElems, rawName, nextName, false);
                return;
              }
            }
          } catch (e) { }
        }
        if (namesList.length > 0) {
          this.getDataAndUpdatePage(nameElems, rawName, namesList);
        } else {
          this.addLinkToSearchPage(nameElems, rawName, nextName, true);
        }
      }
    );
  }

  updateInstructorName(rawName, nameElems, bgColor, href, rating, evals) {
    nameElems.forEach((nameElem) => {
      let anchor = `<a href="${href}" target="_blank" class="ratingLink">`;
      nameElem.html(anchor + nameElem.html() + '</a>');
      nameElem.after(`<td>${anchor}
        <div class="rating">${rating}</div>
        <div>${evals}</div>
      </a></td>`);
      if (this.showBackgroundColors) {
        let css = {
          'background': 'white',
          'background-image': `linear-gradient(${bgColor},${bgColor})`
        };
        nameElem.css(css);
        nameElem.next().css(css);
      }
      this.updateAttachedRows(nameElem);
    });
    let info = this.createInfo({
      bgColor: bgColor,
      href: href,
      rating: rating,
      evals: evals
    });
    let data = {};
    data[rawName] = JSON.stringify(info);
    chrome.storage.local.set(data);
  }

  addLinkToSearchPage(nameElems, rawName, lastName, notFound) {
    if (notFound) {
      nameElems.forEach((nameElem) => {
        nameElem.after(this.centeredTd('not found'));
        this.updateAttachedRows(nameElem);
      });
    } else {
      let href = `http://polyratings.com/search.php?type=ProfName&terms=${lastName}&format=long&sort=name`;
      nameElems.forEach((nameElem) => {
        let anchor = `<a href="${href}" target="_blank" class="ratingLink">`;
        nameElem.html(anchor + nameElem.html() + '</a>');
        nameElem.after(this.centeredTd(anchor + 'click here</a>'));
        this.updateAttachedRows(nameElem);
      });
    }
    let info = this.createInfo({
      lastName: lastName,
      notFound: notFound,
      ambiguous: !notFound
    });
    let data = {};
    data[rawName] = JSON.stringify(info);
    chrome.storage.local.set(data);
  }

  foundStaff(nameElem) {
    if (this.hideStaffClasses) {
      // hide row
      let row = nameElem.parent();
      row.hide();
      // hide row above (section notes)
      let rowAbove = row.prev();
      let sectionNotes = rowAbove.find('td > .section-notes');
      if (sectionNotes[0]) {
        rowAbove.hide();
      }
      // hide row(s) below (if any)
      row = row.next();
      let colSpanTd = row.find('td:first-child[colspan]')[0];
      while (colSpanTd) {
        row.hide();
        row = row.next();
        colSpanTd = row.find('td:first-child[colspan]')[0];
      }
    } else {
      nameElem.after(this.centeredTd('n/a'));
      this.updateAttachedRows(nameElem);
    }
  }

  /*** UTILS ***/

  updateAttachedRows(nameElem) {
    let nextRow = nameElem.parent().next();
    let colSpanTd = nextRow.find('td:first-child[colspan]')[0];
    while (colSpanTd) {
      colSpanTd.colSpan += 1;
      nextRow = nextRow.next();
      colSpanTd = nextRow.find('td:first-child[colspan]')[0];
    }
  }

  removeAllSingleLetters(name) {
    let modified = [];
    let parts = name.split(' ');
    parts.forEach((part) => {
      if (/[a-z]{2,}/.test(part)) {
        modified.push(part);
      }
    });
    return modified.join(' ').trim();
  }

  urlFormat(str) {
    return str.replace(/ /g, '+');
  }

  calculateBackgroundColor(rating) {
    let r = rating < 3 ? 255 : 255 * (4 - rating) / 4;
    let g = rating < 3 ? 255 * rating / 3 : 255;
    return `rgba(${Math.round(r)},${Math.round(g)},0,0.7)`;
  }

  centeredTd(text) {
    return `<td style="text-align:center">${text}</td>`;
  }

  createInfo(data) {
    data['timestamp'] = Date.now();
    return data;
  }
}
