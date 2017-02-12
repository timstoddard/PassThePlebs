/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import urlRegex from 'url-regex'
import { hideRow, grayOutRow } from './row-utils'
import defaults from '../../shared/defaults'

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
    this.integrateRowOptions()
    this.moveErrorList()
    this.fixSectionNotes()
    this.fixNoSchedulesGeneratedMessage()
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
            'filter': 'hue-rotate(75deg) brightness(200%)',
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

      let css = ''
      themeStyles.forEach(style => {
        css += `${style.selectors.join(',')}{`
        for (let prop in style.cssProps) {
          css += `${prop}:${style.cssProps[prop]} !important;`
        }
        css += '}'
      })
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
  }

  updateRows(name, selector) {
    if (this.options[name] === 'hidden') {
      $(selector).each((i, elem) => {
        hideRow($(elem), false)
      })
    } else if (this.options[name] === 'gray') {
      $(selector).each((i, elem) => {
        grayOutRow($(elem), false)
      })
    }
  }

  fixSectionHeaders() {
    $.ajax({
      dataType: 'json',
      url: 'removeCourse.json',
      data: {
        courseId: -1,
      },
      cache: false,
      success: courses => {
        // add descriptions to the section headers
        const headers = $('.select-course > h3')
        courses.forEach((course, i) => {
          const header = $(headers[i])
          const headerContent = $(header.contents()[0])
          const headerText = headerContent.text().replace(/\s+/g, ' ').trim()
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
          data: {
            courseId: id,
          },
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
        const selectAllCheckbox = $('<input class="selectAll" type="checkbox" style="margin-left:4px">')
        const headerChildren = table.find('thead > tr').children()
        selectAllCheckbox.click(e => {
          const checked = e.target.checked
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

  integrateRowOptions() {
    const sidebarLists = $('.sidebar > ul')
    if (sidebarLists.length === 2) {
      const key = $(sidebarLists[1])
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

        const backgroundColors = this.createCheckboxOption(options, 'Show Background Colors', 'showBackgroundColors')
        staff.parent().next().after(backgroundColors)
        backgroundColors.wrap('<li class="clearfix">')
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
}
