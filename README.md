This Chrome extension adds several useful features, such as Polyrating integration, to the class listings on PASS.

[Chome webstore link](https://chrome.google.com/webstore/detail/pass-the-plebs/mhglgbabaleaegjhdcmfffkaaklpmjog)

Features:
* Polyrating and number of evaluations appear below the instructor's name
* Background behind the instructor's name changes color
  * Green = Good
  * Yellow = Pretty good
  * Orange = Okay
  * Red = Bad
* Click on any teacher's name to see their full Polyratings page (if it exists)
* Options to hide closed, cancelled, or conflicting classes
* Options to gray out closed or conflicting classes
* Option to hide classes that have STAFF listed as the instructor
* Checkbox at the top of each class list to select/unselect all classes at once
* Section headers now have a link to the class in the course catalog
* Errors list is now part of the sidebar instead of on top of the class lists

Modifying source
* Clone or download repo
* Run `npm install`, which will:
  * Install dependencies
  * Install chrome-cli (used for reloading on save)
* Edit away! The code will be built and the extension refreshed every time you save.
  * Note: You will need the ['Run on Save' extension for VS code](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave), otherwise you must run `npm run build` every time you want to build the extension.

Inspired by [this Chrome extension](https://github.com/RobertUrsua/BruinWalkChromeExtension)
