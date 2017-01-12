/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { PolyratingIntegrator } from './add-polyratings';
import { PassLayoutFixer } from './fix-pass-layout';
import { SHOW_BACKGROUND_COLORS_DEFAULT, HIDE_STAFF_CLASSES_DEFAULT } from './defaults';
import { DNE } from './utils';

import '../scss/index.scss';

chrome.storage.sync.get(
  [
    'showBackgroundColors',
    'hideClosedClasses',
    'hideCancelledClasses',
    'hideConflictingClasses',
    'hideStaffClasses'
  ],
  (options) => {
    let showBackgroundColors = DNE(options.showBackgroundColors)
      ? SHOW_BACKGROUND_COLORS_DEFAULT
      : options.showBackgroundColors;
    let hideStaffClasses = DNE(options.hideStaffClasses)
      ? HIDE_STAFF_CLASSES_DEFAULT
      : options.hideStaffClasses;
    let integrator = new PolyratingIntegrator(showBackgroundColors, hideStaffClasses);
    integrator.addPolyratings();
    let fixer = new PassLayoutFixer(options);
    fixer.fixPassLayout();
  });
