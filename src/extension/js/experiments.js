/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */
/* eslint-disable no-alert,no-console */

export default class Experiments {
  start() {
    // this.addAllCourses()
    // this.makeLinkedLecturesAndLabsToggleTogether()
    this.addAllCoursesByDepartment('ag')
  }

  addAllCourses() {
    $.ajax({
      dataType: 'json',
      url: 'removeCourse.json',
      data: {
        courseId: -1,
      },
      cache: false,
      success: data => {
        if (data.length === 0) {
          this.addAllCoursesByDepartment()
        }
      },
    })
  }

  addAllCoursesByDepartment(department = '') {
    const counts = {
      expectedDeptCount: 0,
      deptCount: 0,
      expectedCourseCount: 0,
      courseCount: 0,
    }
    $('#filterbox-list-view > li > select[data-filter="dept"] > option').each((i, elem) => {
      const isMatchingDepartment = department
        ? new RegExp(`^${department}[^a-z]`, 'i').test(elem.innerText)
        : true
      if (isMatchingDepartment) {
        counts.expectedDeptCount++
        $.ajax({
          dataType: 'json',
          url: 'searchByDept.json',
          data: {
            deptId: elem.value,
          },
          cache: false,
          success: courses => {
            this.addAllCoursesForDepartment(courses, counts)
          },
        })
      }
    })
  }

  addAllCoursesForDepartment(courses, counts) {
    counts.deptCount++
    if (courses.length > 0) {
      counts.expectedCourseCount += courses.length
      courses.forEach(course => {
        $.ajax({
          dataType: 'json',
          url: 'addCourse.json',
          cache: false,
          data: {
            courseId: course.id,
          },
          success: () => {
            this.addCourse(course, counts)
          },
        })
      })
    }
  }

  addCourse(course, counts) {
    counts.courseCount++
    console.log(`Added ${course.subject} ${course.catalogNumber}.`)
    const countsMatchExpectedCounts = counts.deptCount === counts.expectedDeptCount
      && counts.courseCount === counts.expectedCourseCount
    if (countsMatchExpectedCounts) {
      console.log('done')
      setTimeout(() => {
        if (confirm('Reload?')) { // eslint-disable-line no-restricted-globals
          window.location.reload()
        }
      })
    }
  }

  makeLinkedLecturesAndLabsToggleTogether() {
    // mark relevant checkboxes
    $('.no-bg > tbody').each((_, elem) => {
      const sectionNumbers = $(elem).find('.sectionNumber')
      for (let i = 0; i < sectionNumbers.length - 1; i++) {
        const classType = this.getClassTypeFromSectionNumber(sectionNumbers[i])
        const nextClassType = this.getClassTypeFromSectionNumber(sectionNumbers[i + 1])
        const nextNextClassType = this.getClassTypeFromSectionNumber(sectionNumbers[i + 2])
        if (classType === 'LEC' && nextClassType === 'LAB' && nextNextClassType !== 'LAB') {
          const classCheckbox = $(this.getCheckboxFromSectionNumber(sectionNumbers[i]))
          // being a sneaky snake and incrementing `i` here, since we don't need
          // to check the next row now that we know it's already been hooked up
          const nextClassCheckbox = $(this.getCheckboxFromSectionNumber(sectionNumbers[++i]))

          // add event listeners
          // TODO: need to find way to fix circular logic (recurison?)
          classCheckbox.click(() => {
            nextClassCheckbox.click()
          })
          nextClassCheckbox.click(() => {
            classCheckbox.click()
          })
        }
      }
    })
  }

  getClassTypeFromSectionNumber(elem) {
    return elem ? $(elem).next().html() : ''
  }

  getCheckboxFromSectionNumber(elem) {
    return $(elem).parent().find('input[type="checkbox"]')
  }
}
