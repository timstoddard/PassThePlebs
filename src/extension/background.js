/**
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

// helper for http calls
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  if (request.action === 'xhttp') {
    const xhttp = new XMLHttpRequest()
    const method = request.method ? request.method.toUpperCase() : 'GET'
    xhttp.onload = () => callback(xhttp.responseText)
    xhttp.onerror = () => callback('error')
    xhttp.open(method, request.url, true)
    if (method === 'POST') {
      xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    xhttp.send(request.data)
    return true // prevents the callback from being called too early on return
  }
})

// context menu option
chrome.storage.sync.get('showNewTheme', data => {
  chrome.contextMenus.create({
    'title': 'Use New Theme',
    'type': 'checkbox',
    'contexts': ['all'],
    'documentUrlPatterns': ['https://pass.calpoly.edu/*'],
    'checked': data.showNewTheme,
    'onclick': (info, tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleTheme', showNewTheme: info.checked })
    },
  })
})

// omnibox stuff
chrome.omnibox.setDefaultSuggestion({ description: 'Look up \'%s\' on Polyratings.com' })
chrome.omnibox.onInputEntered.addListener(text => {
  const classFormat = /[a-z]+ \d+/.test(text)
  const searchType = classFormat ? 'class' : 'profname'
  const sort = classFormat ? 'rating' : 'name'
  const searchTerm = text.replace(/ /g, '+')
  const url = `http://polyratings.com/search.php?type=${searchType}&terms=${searchTerm}&format=long&sort=${sort}`
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.update(tabs[0].id, { url })
  })
})
