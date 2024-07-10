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

// ストレージの変更をリッスン
chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('Storage area changed:', areaName);
    console.log('Changes:', changes);

    // アクティブなタブにメッセージを送信
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: 'yourLocalStorageKeyChanged' });
    });

});