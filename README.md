This Chrome extension adds several useful features, such as Polyrating integration, to the class listings on PASS.

[Chome webstore link](https://chrome.google.com/webstore/detail/pass-the-plebs/mhglgbabaleaegjhdcmfffkaaklpmjog)

Features:
* Polyrating and number of evaluations appear next to the instructor's name (if they exist)
* Background behind the instructor's name changes color:
  * Green = Good
  * Yellow = Pretty good
  * Orange = Okay
  * Red = Bad
* Click on any teacher's name to see their full Polyratings page (if it exists)
* Search Polyratings for teachers and classes from the Chrome search bar (keyword is 'rating')
* Options to gray out or hide classes that are closed, cancelled, conflict with your schedule, or have STAFF listed as the instructor
* Checkbox at the top of each class list to select/unselect all classes at once
* Click on any section header to toggle the course description
* Errors list is now part of the sidebar instead of on top of the class listings

Modifying source
* Clone or download repo
* Run `npm install`, which will:
  * Install dependencies
  * Install chrome-cli (used for reloading PASS in Chrome on save)
* Edit away! The code will be built and the extension refreshed every time you save.
  * Note: You will need the ['Run on Save' extension for VS code](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave), otherwise you must run `npm run build` every time you want to build the extension.

Inspired by [this Chrome extension](https://github.com/RobertUrsua/BruinWalkChromeExtension)
