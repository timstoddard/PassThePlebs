/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import urlRegex from 'url-regex'
import defaults from '../../shared/defaults'

export default class PassLayoutFixer {
  options;

  constructor(options) {
    this.options = options
  }

  fixPassLayout() {
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

  fadeInContent() {
    $('.content').addClass('visible')
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
        const row = $(elem)
        const input = row.find('input[type="checkbox"]')
        if (input[0]) {
          input.addClass('hiddenInput')
        }
        row.hide()
        this.uncheckCheckbox(row)
        const rowAbove = row.prev()
        const sectionNotes = rowAbove.find('td > .section-notes')
        if (sectionNotes[0]) {
          // if section notes exist, the input checkbox is always part of that row
          rowAbove.find('input[type="checkbox"]').addClass('hiddenInput')
          rowAbove.hide()
          this.uncheckCheckbox(rowAbove)
        }
      })
    } else if (this.options[name] === 'gray') {
      $(selector).each((i, elem) => {
        const row = $(elem)
        const grayText = { color: 'rgb(160,160,160)' }
        row.css(grayText)
        const rowAbove = row.prev()
        const sectionNotes = rowAbove.find('td > .section-notes')
        if (sectionNotes[0]) {
          rowAbove.css(grayText)
        }
      })
    }
  }

  uncheckCheckbox(row) {
    const checkbox = row.find('input[type="checkbox"]:checked')
    if (checkbox[0]) {
      checkbox.click()
    }
  }

  fixSectionHeaders() {
    // add descriptions to the section headers
    $.ajax({
      dataType: 'json',
      url: 'removeCourse.json',
      data: {
        courseId: -1,
      },
      cache: false,
      success: data => {
        const headers = $('.select-course > h3')
        data.forEach((course, i) => {
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
    checkboxWrapper.append(name)
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
