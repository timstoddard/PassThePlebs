/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import PolyratingIntegrator from './add-polyratings'
import PassLayoutFixer from './fix-pass-layout'
import defaults from '../../shared/defaults'

export default class PassExtension {
  start() {
    chrome.storage.sync.get(defaults, options => {
      const integrator = new PolyratingIntegrator(options)
      integrator.addPolyratings()
      const fixer = new PassLayoutFixer(options)
      fixer.fixPassLayout()
    })
  }
}
