/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { DNE } from './utils';

export class PassLayoutFixer {
  options;

  constructor(options) {
    this.options = options;
  }

  fixPassLayout() {
    this.hideRowsBasedOnOptions();
    this.moveErrorList();
    this.addSelectAll();
    this.fixSectionHeaders();
  }

  hideRowsBasedOnOptions() {
    this.hideRows('hideClosedClasses', 'tr.key-closed');
    this.hideRows('hideCancelledClasses', 'tr.key-cancel');
    this.hideRows('hideConflictingClasses', 'tr.key-avail');
  }

  hideRows(name, selector) {
    if (this.options[name]) {
      $(selector).each(this.hideClassRow);
    }
  }

  hideClassRow() {
    let row = $(this);
    row.hide();
    let rowAbove = row.prev();
    let sectionNotes = rowAbove.find('td > .section-notes');
    if (sectionNotes[0]) {
      rowAbove.hide();
    }
  }

  moveErrorList() {
    // move errors to the left side
    let errors = $('#error').detach();
    errors.appendTo('.sidebar');
  }

  addSelectAll() {
    // add select all checkboxes
    $('.select-course > table > thead > tr').each((i, elem) => {
      let headers = $(elem).children();
      let input = $('<input class="selectAll" type="checkbox" style="margin-left:4px">');
      input.click((e) => {
        let selectAll = e.target;
        let checked = selectAll.checked;
        let table = $(selectAll).parent().parent().parent().parent();
        table.find('tbody > tr > td > input[type="checkbox"]').each((i, elem) => {
          elem.checked = !checked;
          $(elem).click();
        });
      });
      $(headers[0]).append(input);
      $(headers[4]).after('<th>Polyrating</th>');
    });

    // update the select all checkboxes to checked if all their children all checked
    $('.selectAll').each((i, elem) => {
      let table = $(elem).parent().parent().parent().parent();
      let allChecked = true;
      table.find('tbody > tr > td > input[type="checkbox"]').each((i, elem) => {
        allChecked &= elem.checked;
      });
      elem.checked = allChecked;
    });

    // restyle the checkboxes
    $('td > input[type="checkbox"]').each((i, elem) => {
      let input = $(elem);
      input.removeClass('left');
      input.parent().css('text-align', 'center');
    });

    // listen for child checkbox changes to update its select all checkbox
    $('td > input[type="checkbox"]:not(.selectAll)').click((e) => {
      let elem = e.target;
      let table = $(elem).parent().parent().parent().parent();
      let allChecked = true;
      table.find('tbody > tr > td > input[type="checkbox"]').each((i, elem) => {
        allChecked &= elem.checked;
      });
      let selectAll = table.find('.selectAll');
      selectAll[0].checked = allChecked;
    });
  }

  fixSectionHeaders() {
    // add catalog link to section headers
    $('.select-course > h3').each((i, elem) => {
      let header = $(elem);
      let headerContent = $(header.contents()[0]);
      let headerText = headerContent.text().replace(/\s+/g, ' ').trim();
      let course = headerText
        .match(/([a-z]+ \d+)/i)[0]
        .replace(' ', '+');
      headerContent.wrap(`<a href="http://catalog.calpoly.edu/search/?P=${course}" target="_blank" class="headerLink"></a>`);
      headerContent.replaceWith(`<span class="headerText">${headerText}</span>`);
    });
  }
}
