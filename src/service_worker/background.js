import { setSessionStorage } from '../integrations/chrome/sessionApi.js'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);

  setSessionStorage(request);
});