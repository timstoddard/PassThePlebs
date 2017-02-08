/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { defaults, optionNames } from '../shared/defaults'
import { value } from '../shared/utils'

export default class OptionsForm {
  showBackgroundColors;
  radioElems;

  constructor() {
    this.showBackgroundColors = document.getElementById('showBackgroundColors')
    this.radioElems = {}
    optionNames.forEach(name => {
      if (name !== 'showBackgroundColors') {
        this.radioElems[name] = document.querySelectorAll(`input[name="${name}"]`)
      }
    })
  }

  init() {
    this.loadStoredData()
    this.addEventListeners()
  }

  loadStoredData() {
    chrome.storage.sync.get(optionNames, options => {
      optionNames.forEach(name => {
        if (name === 'showBackgroundColors') {
          this.showBackgroundColors.checked = value(options[name], defaults[name])
        } else {
          const initialValue = value(options[name], defaults[name])
          this.updateRadios(name, initialValue)
        }
      })
    })
  }

  addEventListeners() {
    this.showBackgroundColors.addEventListener('click', () => {
      chrome.storage.sync.set({ showBackgroundColors: this.showBackgroundColors.checked })
    })
    optionNames.forEach(name => {
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
    document.getElementById('restoreDefaults')
      .addEventListener('click', () => {
        const data = {}
        optionNames.forEach(name => {
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
