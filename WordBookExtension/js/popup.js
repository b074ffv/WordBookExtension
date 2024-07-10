
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({ wordList: [], categoryList: {} }, function (result) {
        let wordList = result.wordList;
        let categoryList = result.categoryList;
        let body = document.getElementById('wordBook_body');

        Object.entries(categoryList).forEach(([category, idList]) => {
            let wordList_ext = wordList.filter(element => idList.includes(element.uuid)); // カテゴリに含まれている単語を単語リストから抽出
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

                // 単語名
                let div_wordName = Object.assign(document.createElement('div'), {
                    className: `t div_wordName`,
                    textContent: word.name,
                });
                div_word.appendChild(div_wordName);

                // 単語の説明
                let div_wordDesc = Object.assign(document.createElement('div'), {
                    className: `t div_wordData`,
                    textContent: word.desc,
                });
                div_word.appendChild(div_wordDesc);

                // デバッグ情報
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

                // 削除ボタン
                let bt_delete = Object.assign(document.createElement('button'), {
                    className: 't button_delete',
                    textContent: 'delete',
                });
                bt_delete.addEventListener('click', function () {
                    wordList = wordList.filter(element => element.uuid !== word.uuid); // 単語を単語リストから除去
                    // 単語をカテゴリリストから除去
                    Object.entries(categoryList).forEach(([key, value]) => {
                        categoryList[key].filter(element => element.uuid !== word.uuid);
                    });
                    chrome.storage.local.set({ wordList: wordList, categoryList: categoryList }, function () {
                        console.log(`Deleted: ${word.name}`);
                    });
                    div_word.remove(); // 単語を除去
                });
                div_word.appendChild(bt_delete);

                div_category.appendChild(div_word);
            });
            body.appendChild(div_category);
        });
        // 全削除ボタン
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
            body.replaceChildren() // 単語をすべて除去
            body.appendChild(button_deleteAll);
        });
        body.appendChild(button_deleteAll);
    });
});

