chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
    console.log('Action button clicked');
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});
