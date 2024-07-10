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

// �X�g���[�W�̕ύX�����b�X��
chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('Storage area changed:', areaName);
    console.log('Changes:', changes);

    // �A�N�e�B�u�ȃ^�u�Ƀ��b�Z�[�W�𑗐M
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: 'yourLocalStorageKeyChanged' });
    });

});