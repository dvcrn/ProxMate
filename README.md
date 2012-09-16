## ProxMate Browser Extension

ProxMate is a Browser extension for accessing pages blocked by country restrictions.

##### AppStore releases:

* Chrome: https://chrome.google.com/webstore/detail/hgjpnmnpjmabddgmjdiaggacbololbjm
* Firefox: https://addons.mozilla.org/en-US/firefox/addon/proxmate/


##### Currently included:

 * Youtube
 * Grooveshark
 * Pandora
 * Hulu


### Installation / Building

#### Chrome

1. Download Source
2. Set chrome extension in developer mode (by ticking the little checkbox)
3. Click "Load unpacked extension"
4. Browser to your source directory
5. Profit


#### Firefox

1. Download Source
2. Download the latest addon-sdk here: https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip
3. Navigate to your proxomate source folder
4. Run ./path-to-addonsdk/bin/cfx xpi (This will create a .xpi file for you)
5. Load the packed .xpi in Firefox
6. Profit