
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

                // �P�ꖼ
                let div_wordName = Object.assign(document.createElement('div'), {
                    className: `t div_wordName`,
                    textContent: word.name,
                });
                div_word.appendChild(div_wordName);

                // �P��̐���
                let div_wordDesc = Object.assign(document.createElement('div'), {
                    className: `t div_wordData`,
                    textContent: word.desc,
                });
                div_word.appendChild(div_wordDesc);

                // �f�o�b�O���
                let bt_debugInfo = Object.assign(document.createElement('button'), {
                    className: `t div_debugInfo`,
                    textContent: `debug info...`,
                    isClosed: true,
                });
                bt_debugInfo.addEventListener('click', function () {
                    let isClosed = bt_debugInfo.isClosed;
                    bt_debugInfo.textContent = isClosed ? JSON.stringify(word) : `debug info...`;
                    bt_debugInfo.isClosed = !isClosed;
                });
                div_word.appendChild(bt_debugInfo);

                // �폜�{�^��
                let bt_delete = Object.assign(document.createElement('button'), {
                    className: 't button_delete',
                    textContent: 'delete',
                });
                bt_delete.addEventListener('click', function () {
                    wordList = wordList.filter(element => element.uuid !== word.uuid); // �P���P�ꃊ�X�g���珜��
                    // �P����J�e�S�����X�g���珜��
                    Object.entries(categoryList).forEach(([key, value]) => {
                        categoryList[key].filter(element => element.uuid !== word.uuid);
                    });
                    chrome.storage.local.set({ wordList: wordList, categoryList: categoryList }, function () {
                        console.log(`Deleted: ${word.name}`);
                    });
                    div_word.remove(); // �P�������
                });
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

