/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

/* eslint-disable no-console */

export default class Experiments {
  start() {
    // this.addAllCourses()
    this.makeLinkedLecturesAndLabsToggleTogether()
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

  addAllCoursesByDepartment() {
    const counts = {
      expectedDeptCount: 0,
      deptCount: 0,
      expectedCourseCount: 0,
      courseCount: 0,
    }
    $('#filterbox-list-view > li > select[data-filter="dept"] > option').each((i, elem) => {
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
    if (counts.deptCount === counts.expectedDeptCount &&
      counts.courseCount === counts.expectedCourseCount) {
      console.log('done')
      setTimeout(() => {
        if (confirm('Reload?')) {
          window.location.reload()
        }
      })
    }
  }

  makeLinkedLecturesAndLabsToggleTogether() {
    // mark relevant checkboxes
    $('.no-bg > tbody').each((i, elem) => {
      const sectionNumbers = $(elem).find('.sectionNumber')
      for (let i = 0; i < sectionNumbers.length - 1; i++) {
        let classType = this.getClassTypeFromSectionNumber(sectionNumbers[i])
        let nextClassType = this.getClassTypeFromSectionNumber(sectionNumbers[i + 1])
        let nextNextClassType = this.getClassTypeFromSectionNumber(sectionNumbers[i + 2])
        if (classType === 'LEC' && nextClassType === 'LAB' && nextNextClassType !== 'LAB') {
          let classCheckbox = $(this.getCheckboxFromSectionNumber(sectionNumbers[i]))
          // being a sneaky snake and incrementing `i` here, since we don't need
          // to check the next row now that we know it's already been hooked up
          let nextClassCheckbox = $(this.getCheckboxFromSectionNumber(sectionNumbers[++i]))

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
