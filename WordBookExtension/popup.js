document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({ savedTexts: [] }, function (result) {
        let savedTexts = result.savedTexts;
        let textList = document.getElementById('textList');
        savedTexts.forEach(function (text) {
            let li = document.createElement('li');
            let word = document.createElement('p');
            word.id = 'word';
            let button = document.createElement('button');
            button.id = 'deleteWordButton';
            button.textContent = 'delete';
            button.addEventListener('click', function () {
                li.remove();
                savedTexts.splice(savedTexts.indexOf(text), 1);
                chrome.storage.local.set({ savedTexts: savedTexts }, function () {
                    console.log(`Deleted: ${text}`);
                });
            });
            word.textContent = text;
            li.appendChild(word);
            li.appendChild(button);
            textList.appendChild(li);
        });
    });
});