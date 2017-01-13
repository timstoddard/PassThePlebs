/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

// note: whenever an option is added here,
// update getTemplateData in webpack/utils
export const defaults = {
  'showBackgroundColors': true,
  'grayClosedClasses': false,
  'hideClosedClasses': false,
  'hideCancelledClasses': true,
  'grayConflictingClasses': false,
  'hideConflictingClasses': false,
  'hideStaffClasses': false
};

export const optionNames = [
  'showBackgroundColors',
  'grayClosedClasses',
  'hideClosedClasses',
  'hideCancelledClasses',
  'grayConflictingClasses',
  'hideConflictingClasses',
  'hideStaffClasses'
];
