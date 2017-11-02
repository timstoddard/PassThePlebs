/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import urlRegex from 'url-regex'
import { hideRow, grayOutRow } from './row-utils'
import defaults from '../../shared/defaults'
import {
  ALMOST_CLOSED_SECTIONS_MIN_VALUE,
  ALMOST_CLOSED_SECTIONS_MAX_VALUE
} from '../../shared/constants'

export default class PassLayoutFixer {
  options;

  constructor(options) {
    this.options = options
  }

  fixPassLayout() {
    this.addThemeColor()
    this.fixPageHeader()
    this.fadeInContent()
    this.updateRowsBasedOnOptions()
    this.fixSectionHeaders()
    this.addRemoveButtons()
    this.addSelectAll()
    this.integrateOptions()
    this.moveErrorList()
    this.fixSectionNotes()
    this.fixNoSchedulesGeneratedMessage()
    this.makeSelectThisScheduleTextClickable()
  }

  addThemeColor() {
    if (this.options.showNewTheme) {
      const themeColor = 'rgb(0,175,255)'
      const themeColorLight = 'rgba(0,175,255,0.6)'
      const themeStyles = [
        {
          selectors: [
            '.filter-list > li h2',
            '.select-course > h3',
            '.select-course > h3 .ge-tag',
            '.nav-top',
            '.cart > li:first-child',
            '.cart > li:first-child a',
            '.courseDescription',
          ],
          cssProps: {
            'background-color': `${themeColor}`,
          },
        },
        {
          selectors: [
            '.pageHeader a',
          ],
          cssProps: {
            'color': `${themeColor}`,
          },
        },
        {
          selectors: [
            '.steps .active',
            '.steps .completed',
          ],
          cssProps: {
            'border-bottom-color': `${themeColor}`,
            'color': `${themeColor}`,
          },
        },
        {
          selectors: [
            '.cp-logo > a > img',
          ],
          cssProps: {
            'filter': 'hue-rotate(75deg) brightness(235%)',
          },
        },
        {
          selectors: [
            '.btn-next',
          ],
          cssProps: {
            'background-color': 'white',
            'background-image': `linear-gradient(${themeColorLight}, ${themeColor} 95%)`,
          },
        },
        {
          selectors: [
            '.btn-next[enabled="false"]',
            '.btn-next:hover',
            '.btn-next:focus',
          ],
          cssProps: {
            'background-color': `${themeColor}`,
            'background-image': 'none',
          },
        },
      ]

      const css = themeStyles.map(style => {
        let styles = ''
        for (let prop in style.cssProps) {
          styles += `${prop}:${style.cssProps[prop]} !important;`
        }
        return `${style.selectors.join(',')}{${styles}}`
      }).join('')
      $(document.head).append(`<style>${css}</style>`)
    }
  }

  fixPageHeader() {
    const headerImg = $('.pageTitle > img')
    headerImg.hide()
    headerImg.after(`
      <div class="pageTitle__main">
        PASS (Plan a Student Schedule)
      </div>
    `)
  }

  fadeInContent() {
    $('body').addClass('visible')
  }

  updateRowsBasedOnOptions() {
    // hide/gray out rows if necessary
    this.updateRows('closedClasses', 'tr.key-closed')
    this.updateRows('cancelledClasses', 'tr.key-cancel')
    this.updateRows('conflictingClasses', 'tr.key-avail')

    // fix alternating white/gray rows
    $('.select-course > table > tbody').each((i, elem) => {
      let rowShouldBeGray = false // first <tr> should be white
      $(elem).find('tr:visible').each((i, elem) => {
        const row = $(elem)
        if (rowShouldBeGray && row.hasClass('row-white')) {
          row.removeClass('row-white').addClass('row-gray')
        } else if (!rowShouldBeGray && row.hasClass('row-gray')) {
          row.removeClass('row-gray').addClass('row-white')
        }

        // if current row has section notes, row below needs to be same color
        if (!row.find('td > .section-notes')[0]) {
          rowShouldBeGray = !rowShouldBeGray
        }
      })
    })

    // highlight sections with fewer than X spots
    if (this.options['highlightAlmostClosedSections'] === true) {
      let value = this.options['highlightAlmostClosedSectionsThreshold']
      if (value < ALMOST_CLOSED_SECTIONS_MIN_VALUE || value > ALMOST_CLOSED_SECTIONS_MAX_VALUE) {
        value = defaults['highlightAlmostClosedSectionsThreshold']
      }

      $('.select-course > table > tbody > tr > .sectionNumber').each((i, elem) => {
        const openSeatsElem = $(elem).next().next().next().next()
        const reservedSeatsElem = openSeatsElem.next()
        const openSeats = parseInt(openSeatsElem.text(), 10)
        const reservedSeats = parseInt(reservedSeatsElem.text(), 10)
        if (openSeats + reservedSeats < value) {
          openSeatsElem.addClass('highlightAlmostClosedSection--left')
          reservedSeatsElem.addClass('highlightAlmostClosedSection--right')
          openSeatsElem.parent().addClass('highlightAlmostClosedSection')
        }
      })
    }
  }

  updateRows(name, selector) {
    $(selector).each((i, elem) => {
      if (this.options[name] === 'hidden') {
        hideRow($(elem), false)
      } else if (this.options[name] === 'gray') {
        grayOutRow($(elem), false)
      }
    })
  }

  fixSectionHeaders() {
    $.ajax({
      dataType: 'json',
      url: 'removeCourse.json',
      data: { courseId: -1 },
      cache: false,
      success: courses => {
        // add descriptions to the section headers
        $('.select-course > h3').each((i, elem) => {
          const header = $(elem)
          const headerContent = header.contents().eq(0)
          const headerText = headerContent.text().replace(/\s+/g, ' ').trim()

          // make sure description matches the course
          // (summer classes are sometimes out of order due
          // to having several sessions that are grouped together)
          const isCorrectCourse = ({ subject, catalogNumber }) => {
            const regex = new RegExp(`^${subject} ${catalogNumber}`)
            return regex.test(headerText)
          }
          const course = isCorrectCourse(courses[i])
            ? courses[i]
            : courses.find(course => isCorrectCourse(course))

          // add description to the header
          const courseDescription = $(`<div class="courseDescription">${course.description}</div>`)
          headerContent.wrap('<a class="headerLink"></a>')
          headerContent.parent().click(() => {
            courseDescription.toggleClass('expanded')
          })
          headerContent.replaceWith(`<span class="headerText">${headerText}</span>`)
          header.after(courseDescription)
        })

        // remove redundant "GE" from any headers that have them
        $('.ge-tag').each((i, elem) => {
          const geTag = $(elem)
          const headerContent = geTag.parent().contents()
          let geTypeText = headerContent[2].textContent.trim()
          headerContent[2].textContent = ''
          if (/GE/.test(geTypeText)) {
            geTypeText = geTypeText.substr(2)
          }
          geTag.after(`<span class="ge-type">${geTypeText}</span>`)
        })
      },
    })
  }

  addRemoveButtons() {
    $('.cart-action[data-id]').each((i, elem) => {
      const id = $(elem).data('id')
      const headerMap = $(`.select-course:nth-child(${i + 2}) .view-map`)
      const removeButton = $('<a class="removeButton">X</a>')
      headerMap.before(removeButton)
      removeButton.click(() => {
        // modified from filterBox.js
        $.ajax({
          dataType: 'json',
          url: 'removeCourse.json',
          data: { courseId: id },
          cache: false,
          success: data => {
            if (data.length > 0) {
              window.location.reload()
            } else {
              $('#cart-list-view').append('<li>No selected courses</li>')
              window.location = 'prev.do'
              $('#nextBtn').attr('enabled', 'false')
            }
          },
        })
      })
    })
  }

  addSelectAll() {
    // this function must be called after updateRowsBasedOnOptions so that
    // the hidden rows' checkboxes have the `hiddenInput` class

    $('.select-course > table').each((i, elem) => {
      const table = $(elem)
      const checkboxes = table.find('input[type="checkbox"]:not(.hiddenInput)')
      if (checkboxes.length > 0) {
        // restyle the checkboxes
        checkboxes.each((i, elem) => {
          const checkbox = $(elem)
          checkbox.removeClass('left')
          checkbox.parent().css('text-align', 'center')
        })

        // add select all checkboxes to table headers
        const selectAllCheckbox = $('<input class="selectAll" type="checkbox">')
        const headerChildren = table.find('thead > tr').children()
        selectAllCheckbox.click(({ target }) => {
          const { checked } = target
          checkboxes.each((i, elem) => {
            elem.checked = !checked
            $(elem).click()
          })
        })
        headerChildren.eq(0).append(selectAllCheckbox)
        headerChildren.eq(4).after('<th>Polyrating</th>')

        // update the select all checkboxes to checked if all their children all checked,
        // and listen for child checkbox changes to update the parent select all checkbox
        this.updateSelectAllCheckbox(checkboxes, selectAllCheckbox)
        checkboxes.click(() => {
          this.updateSelectAllCheckbox(checkboxes, selectAllCheckbox)
        })
      }
    })
  }

  updateSelectAllCheckbox(checkboxes, selectAllCheckbox) {
    let allChecked = true
    checkboxes.each((i, elem) => {
      allChecked &= elem.checked
    })
    selectAllCheckbox.prop('checked', allChecked)
  }

  integrateOptions() {
    const sidebarLists = $('.sidebar > ul')
    if (sidebarLists.length >= 2) {
      const keyElem = [...sidebarLists].find(list =>
        $(list).find('.cart-list-divider').text() === 'Key')
      const key = $(keyElem)
      const title = key.find('.cart-list-divider')
      title.html('Key/Options')
      const restoreDefaults = $('<a class="detail cart-action">Restore Defaults</a>')
      restoreDefaults.click(() => {
        const defaultOptions = defaults
        // don't reset showNewTheme option
        defaultOptions.showNewTheme = this.options.showNewTheme
        chrome.storage.sync.set(defaultOptions, () => {
          window.location.reload()
        })
      })
      title.append(restoreDefaults)
      const closed = key.find('.key-closed')
      const cancelled = key.find('.key-cancel')
      const conflicting = key.find('.key-avail')
      const staff = $('<span>STAFF classes</span>')
      conflicting.parent().after(staff)
      staff.wrap('<li class="clearfix"></li>')

      chrome.storage.sync.get(defaults, options => {
        closed.after(this.createRadioOptions(options, 'closedClasses'))
        cancelled.after(this.createRadioOptions(options, 'cancelledClasses'))
        conflicting.after(this.createRadioOptions(options, 'conflictingClasses'))
        staff.after(this.createRadioOptions(options, 'staffClasses'))

        const backgroundColors = this.createCheckboxOption(options, 'Show PolyRating background colors', 'showBackgroundColors')
        staff.parent().next().after(backgroundColors)
        backgroundColors.wrap('<li class="clearfix">')

        const { checkboxWrapper, editTrigger } = this.createCheckboxOptionWithNumber(options, 'Highlight sections with fewer than', 'open spot', 'open spots',  'highlightAlmostClosedSections', 'highlightAlmostClosedSectionsThreshold', ALMOST_CLOSED_SECTIONS_MIN_VALUE, ALMOST_CLOSED_SECTIONS_MAX_VALUE)
        staff.parent().next().next().after(checkboxWrapper)
        checkboxWrapper.wrap('<li class="clearfix">')
        checkboxWrapper.after(editTrigger)
      })
    }
  }

  createRadioOptions(options, name) {
    const radioOptions = $(`
      <div class="sidebarRadioList">
        <label class="sidebarRadioItem">
          <input type="radio" name="${name}" value="normal">
          normal
        </label>
        <label class="sidebarRadioItem">
          <input type="radio" name="${name}" value="gray">
          gray
        </label>
        <label class="sidebarRadioItem">
          <input type="radio" name="${name}" value="hidden">
          hidden
        </label>
      </div>
    `)
    const radios = radioOptions.find('input[type="radio"]')
    radios.each((i, radio) => {
      radio.checked = radio.value === options[name]
      $(radio).click(() => {
        chrome.storage.sync.set({ [name]: radio.value })
        window.location.reload()
      })
    })
    return radioOptions
  }

  createCheckboxOption(options, name, optionName) {
    const checkbox = $('<input type="checkbox" class="sidebarCheckboxInput">')
    checkbox.prop('checked', options[optionName])
    checkbox.click(() => {
      chrome.storage.sync.set({ [optionName]: checkbox.prop('checked') })
      window.location.reload()
    })

    const checkboxWrapper = $('<label class="sidebarCheckbox"></li>')
    checkboxWrapper.append(checkbox)
    checkboxWrapper.append(`<span class="sidebarCheckboxLabel">${name}</span>`)
    return checkboxWrapper
  }

  createCheckboxOptionWithNumber(options, beforeNumberText, afterNumberTextSingular, afterNumberTextPlural, checkboxOptionName, numberOptionName, minValue, maxValue) {
    const checkbox = $('<input type="checkbox" class="sidebarCheckboxInput">')
    checkbox.prop('checked', options[checkboxOptionName])
    checkbox.click(() => {
      chrome.storage.sync.set({ [checkboxOptionName]: checkbox.prop('checked') })
      window.location.reload()
    })

    const editTrigger = $('<div class="sidebarNumberEditTrigger">(edit number)</div>')
    editTrigger.click(() => {
      const enterANumber = `Please enter a number between ${ALMOST_CLOSED_SECTIONS_MIN_VALUE} and ${ALMOST_CLOSED_SECTIONS_MAX_VALUE}, inclusive`
      let value = prompt(enterANumber)
      while (value) {
        const trimmedValue = value.trim()
        if (/\d{1,2}/.test(trimmedValue) && trimmedValue >= minValue && trimmedValue <= maxValue) {
          // save the value
          chrome.storage.sync.set({
            [checkboxOptionName]: true,
            [numberOptionName]: parseInt(value, 10),
          })
          window.location.reload()
          break
        }
        value = prompt(enterANumber)
      }
    })

    const labelText = `${beforeNumberText} ${options[numberOptionName]} ${options[numberOptionName] === 1 ? afterNumberTextSingular : afterNumberTextPlural}`

    const checkboxWrapper = $('<label class="sidebarCheckbox"></label>')
    checkboxWrapper.append(checkbox)
    checkboxWrapper.append(`<span class="sidebarCheckboxLabel">${labelText}</span>`)
    return { checkboxWrapper, editTrigger }
  }

  moveErrorList() {
    // move errors to the left side
    const errors = $('#error').detach()
    errors.appendTo('.sidebar')
    errors.addClass('moved')
  }

  fixSectionNotes() {
    // make urls in section notes clickable
    $('.section-notes').each((i, elem) => {
      const sectionNotes = $(elem)
      const urls = sectionNotes.html().match(urlRegex())
      if (urls) {
        urls.forEach(url => {
          const sectionNoteLink = `<a href="${url}" target="_blank" class="sectionNoteLink">${url}</a>`
          sectionNotes.html(sectionNotes.html().replace(url, sectionNoteLink))
        })
      }
    })
  }

  fixNoSchedulesGeneratedMessage() {
    $('.schedulePages').each((i, elem) => {
      const div = $(elem)
      if (i === 0) {
        if (/of 0 total/.test(div.html())) {
          div.html(div.html().replace('1 - 0', '0'))
        }
      } else {
        div.hide()
      }
    })
  }

  makeSelectThisScheduleTextClickable() {
    $('.small-schedule').each((i, elem) => {
      const selectSchedule = $(elem).children().first()
      selectSchedule.wrap('<custom-div class="selectSchedule"></custom-div>')
      selectSchedule.wrap('<label class="selectSchedule__label"></label>')
      selectSchedule.replaceWith(selectSchedule.children())

      const children = $(elem).children().first().children().first().children()
      const radioInput = children.eq(0)
      const selectScheduleText = $('<span class="selectSchedule__text">Select this schedule</span>')
      radioInput.after(selectScheduleText)
    })
  }
}
