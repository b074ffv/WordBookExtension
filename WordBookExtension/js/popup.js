document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({ wordList: [], categoryList: {} }, function (result) {
        let wordList = result.wordList;
        let categoryList = result.categoryList;
        let body = document.getElementById('wordBook_body');

        Object.entries(categoryList).forEach(([category, idList]) => {
            let wordList_ext = wordList.filter(element => idList.includes(element.uuid)); // �J�e�S���Ɋ܂܂�Ă���P���P�ꃊ�X�g���璊�o
            let div_category = Object.assign(document.createElement('div'), {
                className: `t div_category`,
                textContent: category,
            });

            console.log(`${category}: ${JSON.stringify(wordList_ext)}.`);
            wordList_ext.forEach(word => {
                let div_word = Object.assign(document.createElement('div'), {
                    className: `t div_word`,
                    textContent: null,
                });

                let div_wordName = Object.assign(document.createElement('div'), {
                    className: `t div_wordData`,
                    textContent: word.name,
                });

                let div_debugInfo = Object.assign(document.createElement('div'), {
                    className: `t div_debugInfo`,
                    textContent: `debug info...`,
                    isClosed: true,
                });
                div_debugInfo.addEventListener('click', function () {
                    let isClosed = div_debugInfo.isClosed;
                    div_debugInfo.textContent = isClosed ? JSON.stringify(word) : `debug info...`;
                    div_debugInfo.isClosed = !isClosed;
                });
                let bt_delete = Object.assign(document.createElement('button'), {
                    className: 't button_delete',
                    textContent: 'delete',
                });
                bt_delete.addEventListener('click', function () {
                    wordList = wordList.filter(element => element.uuid != word.uuid); // �P���P�ꃊ�X�g���珜��
                    // �P����J�e�S�����X�g���珜��
                    Object.entries(categoryList).forEach(([key, value]) => {
                        categoryList[key].filter(element => element.uuid !== word.uuid);
                    });
                    chrome.storage.local.set({ wordList: wordList, categoryList: categoryList }, function () {
                        console.log(`Deleted: ${word.name}`);
                    });
                    div_word.remove(); // �P�������
                });

                div_word.appendChild(div_wordName);
                div_word.appendChild(div_debugInfo);
                div_word.appendChild(bt_delete);
                div_category.appendChild(div_word);
            });
            body.appendChild(div_category);
        });
        // �S�폜�{�^��
        let button_deleteAll = Object.assign(document.createElement('button'), {
            className: `t button_delete`,
            textContent: 'deleteAll',
        });
        button_deleteAll.addEventListener('click', function () {
            wordList = [];
            categoryList = {};
            chrome.storage.local.set({ wordList: wordList, categoryList: categoryList }, function () {
                console.log(`Deleted: All`);
            });
            body.replaceChildren() // �P������ׂď���
            body.appendChild(button_deleteAll);
        });
        body.appendChild(button_deleteAll);
    });
});

