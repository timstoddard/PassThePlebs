/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import PolyratingIntegrator from './add-polyratings'
import PassLayoutFixer from './fix-pass-layout'
import { defaults, optionNames } from '../../shared/defaults'
import { value } from '../../shared/utils'

export default class PassExtension {
  start() {
    chrome.storage.sync.get(optionNames, options => {
      this.addDefaults(options)
      const integrator = new PolyratingIntegrator(
        options.showBackgroundColors, options.staffClasses)
      integrator.addPolyratings()
      const fixer = new PassLayoutFixer(options)
      fixer.fixPassLayout()
    })
  }

  addDefaults(options) {
    optionNames.forEach(name => {
      options[name] = value(options[name], defaults[name])
    })
  }
}
