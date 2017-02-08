/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

export default class Experiments {
  start() {
    this.addAllCourses()
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
    /* eslint-disable no-console */
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
    /* eslint-enable no-console */
  }
}
