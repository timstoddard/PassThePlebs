/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

export function hideRow(row, checkRowsBelow) {
  // hide row
  const input = row.find('input[type="checkbox"]')
  if (input[0]) {
    input.addClass('hiddenInput')
  }
  row.hide()
  uncheckCheckbox(row)
  // hide row above (section notes), if any
  const rowAbove = row.prev()
  const sectionNotes = rowAbove.find('td > .section-notes')
  if (sectionNotes[0]) {
    // if section notes exist, the input checkbox is always part of that row
    rowAbove.find('input[type="checkbox"]').addClass('hiddenInput')
    rowAbove.hide()
    uncheckCheckbox(rowAbove)
  }
  // hide row(s) below, if any
  if (checkRowsBelow) {
    row = row.next()
    let colSpanTd = row.find('td:first-child[colspan]')[0]
    while (colSpanTd) {
      row.hide()
      row = row.next()
      colSpanTd = row.find('td:first-child[colspan]')[0]
    }
  }
}

export function grayOutRow(row, checkRowsBelow) {
  const grayText = { color: 'rgb(160,160,160)' }
  // gray out row
  row.css(grayText)
  // gray out row above (section notes)
  const rowAbove = row.prev()
  const sectionNotes = rowAbove.find('td > .section-notes')
  if (sectionNotes[0]) {
    rowAbove.css(grayText)
  }
  // gray out row(s) below (if any)
  if (checkRowsBelow) {
    row = row.next()
    let colSpanTd = row.find('td:first-child[colspan]')[0]
    while (colSpanTd) {
      row.css(grayText)
      row = row.next()
      colSpanTd = row.find('td:first-child[colspan]')[0]
    }
  }
}

function uncheckCheckbox(row) {
  const checkbox = row.find('input[type="checkbox"]:checked')
  if (checkbox[0]) {
    checkbox.click()
  }
}
