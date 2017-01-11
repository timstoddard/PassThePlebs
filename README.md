This chrome extension adds Polyratings to the class listings on PASS.

Features:
* Polyrating and number of evaluations appear below the instructor's name
* Background behind the instructor's name changes color
  * Green = Good
  * Yellow = Pretty good
  * Orange = Okay
  * Red = Bad
* Click on any teacher's name to see their full Polyratings page (if it exists)
* Options to hide closed, cancelled, or conflicting classes
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

Chome webstore link: https://chrome.google.com/webstore/detail/pass-the-plebs/mhglgbabaleaegjhdcmfffkaaklpmjog

Inspired by https://github.com/RobertUrsua/BruinWalkChromeExtension
