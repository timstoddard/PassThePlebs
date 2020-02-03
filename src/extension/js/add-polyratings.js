/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { hideRow, grayOutRow } from './row-utils'

const KNOWN_FALSE_NEGATIVES = {
  // BUS
  'Miller II,Charles R': 'Charles Miller',
}

// Maps calpolyratings to polyratings scale for color picker
/* eslint-disable quote-props */
const CAL_POLY_RATINGS_MAP = {
  'A+': 4,
  'A': 3.67,
  'A-': 3.33,
  'B+': 3,
  'B': 2.67,
  'B-': 2.33,
  'C+': 2,
  'C': 1.67,
  'C-': 1.33,
  'D+': 1,
  'D': 0.67,
  'D-': 0.33,
  'F': 0,
}
/* eslint-enable quote-props */

export default class PolyratingIntegrator {
  constructor(options) {
    this.showBackgroundColors = options.showBackgroundColors
    this.staffClassesOption = options.staffClasses
  }

  addPolyratings() {
    const nameGroups = {}
    const rawNames = []

    // make an object with all the instructor names and associated <td> elements
    $('.select-course > table > tbody > tr > .sectionNumber').each((i, elem) => {
      const nameElem = $(elem).next().next().next()
      const rawName = nameElem.text()
      if (rawName !== 'STAFF') {
        if (nameGroups[rawName]) {
          nameGroups[rawName].push(nameElem)
        } else {
          nameGroups[rawName] = [nameElem]
          rawNames.push(rawName)
        }
      } else {
        this.foundStaff(nameElem)
      }
    })

    // loop over all instructor names and get the associated polyrating data
    chrome.storage.local.get(rawNames, data => {
      rawNames.forEach(rawName => {
        const dataForName = data[rawName]
        const nameElems = nameGroups[rawName]
        if (dataForName) {
          const {
            timestamp,
            notFound,
            ambiguous,
            lastName,
            bgColor,
            href,
            rating,
            evals,
          } = JSON.parse(dataForName)
          if ((Date.now() - timestamp) / (1000 * 60) < 10) {
            if (notFound || ambiguous) {
              this.addLinkToSearchPage(nameElems, rawName, lastName, notFound)
            } else {
              this.updateInstructorName(rawName, nameElems, bgColor, href, rating, evals)
            }
          } else {
            this.generateNameCombos(nameElems, rawName)
          }
        } else {
          this.generateNameCombos(nameElems, rawName)
        }
      })
    })
  }

  generateNameCombos(nameElems, rawName) {
    if (KNOWN_FALSE_NEGATIVES[rawName]) {
      this.getDataAndUpdatePage(nameElems, rawName, [KNOWN_FALSE_NEGATIVES[rawName]])
    } else {
      const names = rawName.split(',')
      const lastName = this.removeAllSingleLetters(names[0].trim())
      const firstNames = this.removeAllSingleLetters(names[1].trim())
      const firstNamesList = firstNames.split(' ')
      const namesList = [lastName]
      firstNamesList.forEach(name => {
        namesList.push(this.urlFormat(`${name} ${lastName}`))
      })
      const fullName = this.urlFormat(`${firstNames} ${lastName}`)
      if (!namesList.includes(fullName)) {
        namesList.push(fullName)
      }
      this.getDataAndUpdatePage(nameElems, rawName, namesList)
    }
  }

  getDataAndUpdatePage(nameElems, rawName, namesList) {
    const nextName = namesList.pop()
    chrome.runtime.sendMessage(
      {
        method: 'GET',
        action: 'xhttp',
        url: `http://polyratings.com/search.php?type=ProfName&terms=${nextName}&format=long&sort=name`,
        data: '',
      },
      response => {
        const polyratingPage = $($.parseHTML(response))
        const ratingElem = polyratingPage.find('.hidden-xs > span > .text-primary')
        if (ratingElem[0]) {
          const rating = ratingElem.text()
          const profId = response.match(/profid=(\d+)/)[1]
          const evals = ratingElem.next().text().replace('uation', '')
          const href = `http://polyratings.com/eval.php?profid=${profId}`
          const numericalRating = parseFloat(rating, 10)
          const bgColor = this.calculateBackgroundColor(numericalRating)
          this.updateInstructorName(rawName, nameElems, bgColor, href, rating, evals)
        } else {
          const mainPageHeader = polyratingPage.find('h1.header-text')
          if (namesList.length === 0 && !mainPageHeader[0]) {
            // searched name exists, but there were multiple search results
            // so add a link to the polyratings search page with their last
            // name as the search term
            this.addLinkToSearchPage(nameElems, rawName, nextName, false)
          } else if (namesList.length > 0) {
            this.getDataAndUpdatePage(nameElems, rawName, namesList)
          } else {
            this.addLinkToSearchPage(nameElems, rawName, nextName, true)
          }
        }
      },
    )
  }

  updateInstructorName(rawName, nameElems, bgColor, href, rating, evals) {
    nameElems.forEach(nameElem => {
      const anchor = `<a href="${href}" target="_blank" class="ratingLink">`
      nameElem.html(`${anchor}${nameElem.html()}</a>`)
      nameElem.after(`
        <td>
          ${anchor}
            <div class="rating">${rating}</div>
            <div>${evals}</div>
          </a>
        </td>
      `)
      if (this.showBackgroundColors) {
        const css = {
          background: 'white',
          'background-image': `linear-gradient(${bgColor},${bgColor})`,
        }
        nameElem.css(css)
        nameElem.next().css(css)
      }
      this.updateAttachedRows(nameElem)
    })
    this.setInfo(rawName, {
      bgColor,
      href,
      rating,
      evals,
    })
  }

  addLinkToSearchPage(nameElems, rawName, lastName, notFound) {
    if (notFound) {
      this.checkCalPolyRatings(rawName, nameElems)
    } else {
      const href = `http://polyratings.com/search.php?type=ProfName&terms=${lastName}&format=long&sort=name`
      nameElems.forEach(nameElem => {
        const anchor = `<a href="${href}" target="_blank" class="ratingLink">`
        nameElem.html(`${anchor + nameElem.html()}</a>`)
        nameElem.after(this.centeredTd(`${anchor}click here</a>`))
        this.updateAttachedRows(nameElem)
      })
    }
    this.setInfo(rawName, {
      lastName,
      notFound,
      ambiguous: !notFound,
    })
  }

  checkCalPolyRatings(rawname, nameElems) {
    const [lastName, firstName] = rawname.split(/[, ]/)
      .filter(name => name.length > 2 && name.split('I').length !== name.length + 1) // detects II and M.

    const proxyUrl = 'https://cors-anywhere.herokuapp.com'
    const targetUrl = `https://www.calpolyratings.com/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    const reqOptions = {
      method: 'GET',
      action: 'xhttp',
      url: `${proxyUrl}/${targetUrl}`,
    }

    chrome.runtime.sendMessage(reqOptions, response => {
      try {
        const calPolyRatingPage = $($.parseHTML(response))
        const rating = calPolyRatingPage.find('button > span')[1].innerText
        const evals = calPolyRatingPage.find('button > small > ul > li > span')[2].innerText

        // If all data was recieved ok add to page
        this.updateInstructorName(rawname, nameElems,
          this.calculateBackgroundColor(CAL_POLY_RATINGS_MAP[rating]),
          targetUrl, rating, evals)
      } catch (e) {
        nameElems.forEach(nameElem => {
          nameElem.after(this.centeredTd('not found'))
          this.updateAttachedRows(nameElem)
        })
      }
    })
  }

  foundStaff(nameElem) {
    if (this.staffClassesOption === 'hidden') {
      hideRow(nameElem.parent(), true)
    } else {
      nameElem.after(this.centeredTd('n/a'))
      this.updateAttachedRows(nameElem)
      if (this.staffClassesOption === 'gray') {
        grayOutRow(nameElem.parent(), true)
      }
    }
  }

  /* UTILS */

  updateAttachedRows(nameElem) {
    let nextRow = nameElem.parent().next()
    let colSpanTd = nextRow.find('td:first-child[colspan]')[0]
    while (colSpanTd) {
      colSpanTd.colSpan++
      nextRow = nextRow.next()
      colSpanTd = nextRow.find('td:first-child[colspan]')[0]
    }
  }

  removeAllSingleLetters(name) {
    const modified = []
    const parts = name.split(' ')
    parts.forEach(part => {
      if (/[a-z]{2,}/i.test(part)) {
        modified.push(part)
      }
    })
    return modified.join(' ').trim()
  }

  urlFormat(str) {
    return str.replace(/ /g, '+')
  }

  calculateBackgroundColor(rating) {
    const r = rating < 3 ? 255 : (255 * (4 - rating)) / 4
    const g = rating < 3 ? (255 * rating) / 3 : 255
    return `rgba(${Math.round(r)},${Math.round(g)},0,0.7)`
  }

  centeredTd(text) {
    return `<td class="centeredTd">${text}</td>`
  }

  setInfo(rawName, info) {
    info.timestamp = Date.now()
    chrome.storage.local.set({ [rawName]: JSON.stringify(info) })
  }
}
