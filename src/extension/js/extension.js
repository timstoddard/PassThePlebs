/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import PolyratingIntegrator from './add-polyratings'
import PassLayoutFixer from './fix-pass-layout'
import defaults from '../../shared/defaults'

export default class PassExtension {
  start() {
    // get options and set up the page
    chrome.storage.sync.get(defaults, options => {
      const integrator = new PolyratingIntegrator(options)
      integrator.addPolyratings()
      const fixer = new PassLayoutFixer(options)
      fixer.fixPassLayout()
    })

    // add listener for custom context menu item
    chrome.runtime.onMessage.addListener(request => {
      if (request.action === 'toggleTheme') {
        chrome.storage.sync.set({ 'showNewTheme': request.showNewTheme }, () => {
          window.location.reload()
        })
      }
    })
  }
}
