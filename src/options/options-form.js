/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { defaults, optionNames } from '../shared/defaults';
import { value } from '../shared/utils';

export class OptionsForm {
  showBackgroundColors;
  radioElems;

  constructor() {
    this.showBackgroundColors = document.getElementById('showBackgroundColors');
    this.radioElems = {};
    optionNames.forEach((name) => {
      if (name !== 'showBackgroundColors') {
        this.radioElems[name] = document.querySelectorAll(`input[name="${name}"]`);
      }
    });
  }

  init() {
    this.loadStoredData();
    this.addEventListeners();
  }

  loadStoredData() {
    chrome.storage.sync.get(optionNames, (options) => {
      optionNames.forEach((name) => {
        if (name === 'showBackgroundColors') {
          this.showBackgroundColors.checked = value(options[name], defaults[name]);
        } else {
          let initialValue = value(options[name], defaults[name]);
          this.updateRadios(name, initialValue);
        }
      });
    });
  }

  addEventListeners() {
    this.showBackgroundColors.addEventListener('click', () => {
      let data = {};
      data[name] = this.showBackgroundColors.checked;
      chrome.storage.sync.set(data);
    });
    optionNames.forEach((name) => {
      if (name !== 'showBackgroundColors') {
        let radios = this.radioElems[name];
        for (let i = 0; i < radios.length; i++) {
          let radio = radios[i];
          radio.addEventListener('click', () => {
            let data = {};
            data[name] = radios[i].value;
            chrome.storage.sync.set(data);
          });
        }
      }
    });
    document.getElementById('restoreDefaults')
      .addEventListener('click', () => {
        let data = {};
        optionNames.forEach((name) => {
          if (name === 'showBackgroundColors') {
            this.showBackgroundColors.checked = data[name] = defaults[name];
          } else {
            let defaultValue = data[name] = defaults[name];
            this.updateRadios(name, defaultValue);
          }
        });
        chrome.storage.sync.set(data);
      });
  }

  updateRadios(name, val) {
    let radios = this.radioElems[name];
    for (let i = 0; i < radios.length; i++) {
      let radio = radios[i];
      if (radio.value === val) {
        radio.checked = true;
      }
    }
  }
}
