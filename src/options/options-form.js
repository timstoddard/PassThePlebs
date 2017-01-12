/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

import { defaults, optionNames } from '../shared/defaults';
import { value } from '../shared/utils';

export class OptionsForm {
  checkboxElems;

  constructor() {
    this.checkboxElems = {};
    optionNames.forEach((name) => {
      this.checkboxElems[name] = document.getElementById(name);
    });
  }

  init() {
    this.loadStoredData();
    this.addEventListeners();
  }

  loadStoredData() {
    chrome.storage.sync.get(optionNames, (options) => {
      optionNames.forEach((name) => {
        this.checkboxElems[name].checked = value(options[name], defaults[name]);
      });
    });
  }

  addEventListeners() {
    optionNames.forEach((name) => {
      let elem = this.checkboxElems[name];
      elem.addEventListener('click', () => {
        let data = {};
        data[name] = elem.checked;
        chrome.storage.sync.set(data);
      });
    });
    document.getElementById('restoreDefaults')
      .addEventListener('click', () => {
        let data = {};
        optionNames.forEach((name) => {
          this.checkboxElems[name].checked = data[name] = defaults[name];
        });
        chrome.storage.sync.set(data);
      });
  }
}
