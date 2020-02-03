/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import defaults from '../shared/defaults'

export default class OptionsForm {
  showBackgroundColors;
  radioElems;

  constructor() {
    this.showBackgroundColors = document.getElementById('showBackgroundColors')
    this.radioElems = {}
    Object.keys(defaults).forEach(name => {
      this.radioElems[name] = document.querySelectorAll(`input[name="${name}"]`)
    })
  }

  init() {
    this.loadStoredData()
    this.addEventListeners()
  }

  loadStoredData() {
    chrome.storage.sync.get(defaults, options => {
      Object.keys(options).forEach(name => {
        if (name === 'showBackgroundColors') {
          this.showBackgroundColors.checked = options[name]
        } else {
          this.updateRadios(name, options[name])
        }
      })
    })
  }

  addEventListeners() {
    // background color checkbox
    this.showBackgroundColors.addEventListener('click', () => {
      chrome.storage.sync.set({ showBackgroundColors: this.showBackgroundColors.checked })
    })

    // row options
    Object.keys(defaults).forEach(name => {
      if (name !== 'showBackgroundColors') {
        const radios = this.radioElems[name]
        for (let i = 0; i < radios.length; i++) {
          const radio = radios[i]
          radio.addEventListener('click', () => {
            chrome.storage.sync.set({ [name]: radio.value })
          })
        }
      }
    })

    // restore defaults button
    document.getElementById('restoreDefaults')
      .addEventListener('click', () => {
        const data = {}
        Object.keys(defaults).forEach(name => {
          if (name === 'showBackgroundColors') {
            this.showBackgroundColors.checked = data[name] = defaults[name]
          } else {
            const defaultValue = data[name] = defaults[name]
            this.updateRadios(name, defaultValue)
          }
        })
        chrome.storage.sync.set(data)
      })
  }

  updateRadios(name, val) {
    const radios = this.radioElems[name]
    for (let i = 0; i < radios.length; i++) {
      const radio = radios[i]
      radio.checked = radio.value === val
    }
  }
}
