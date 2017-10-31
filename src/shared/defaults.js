/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

// note: whenever an option is added here, check if
// getRadioHeaders in webpack/utils needs to be updated
const defaults = {
  closedClasses: 'normal',
  cancelledClasses: 'hidden',
  conflictingClasses: 'normal',
  staffClasses: 'normal',
  showBackgroundColors: true,
  highlightAlmostClosedSections: false,
  highlightAlmostClosedSectionsThreshold: 10,
  showNewTheme: false, // "hidden" option, available in context menu
}

export default defaults
