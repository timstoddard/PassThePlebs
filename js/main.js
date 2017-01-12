/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { PolyratingIntegrator } from './add-polyratings';
import { PassLayoutFixer } from './fix-pass-layout';
import { DNE } from './utils';

export class PassExtension {
  start() {
    chrome.storage.sync.get(
      [
        'showBackgroundColors',
        'grayClosedClasses',
        'hideClosedClasses',
        'hideCancelledClasses',
        'hideConflictingClasses',
        'hideStaffClasses'
      ],
      (options) => {
        this.addDefaults(options);
        let integrator = new PolyratingIntegrator(options.showBackgroundColors, options.hideStaffClasses);
        integrator.addPolyratings();
        let fixer = new PassLayoutFixer(options);
        fixer.fixPassLayout();
      });
  }

  addDefaults(options) {
    options['showBackgroundColors'] = this.value(options.showBackgroundColors, Defaults.SHOW_BACKGROUND_COLORS);
    options['grayClosedClasses'] = this.value(options.grayClosedClasses, Defaults.GRAY_CLOSED_CLASSES);
    options['hideClosedClasses'] = this.value(options.hideClosedClasses, Defaults.HIDE_CLOSED_CLASSES);
    options['hideCancelledClasses'] = this.value(options.hideCancelledClasses, Defaults.HIDE_CANCELLED_CLASSES);
    options['hideConflictingClasses'] = this.value(options.hideConflictingClasses, Defaults.HIDE_CONFLICTING_CLASSES);
    options['hideStaffClasses'] = this.value(options.hideStaffClasses, Defaults.HIDE_STAFF_CLASSES);
  }

  value(value, defaultValue) {
    return DNE(value) ? defaultValue : value;
  }
}

class Defaults {
  static get SHOW_BACKGROUND_COLORS() { return true; }
  static get GRAY_CLOSED_CLASSES() { return false; }
  static get HIDE_CLOSED_CLASSES() { return false; }
  static get HIDE_CANCELLED_CLASSES() { return true; }
  static get HIDE_CONFLICTING_CLASSES() { return false; }
  static get HIDE_STAFF_CLASSES() { return false; }
}
