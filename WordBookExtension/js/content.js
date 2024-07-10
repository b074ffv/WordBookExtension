import { v4 as uuidv4 } from 'uuid';

const API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';
const ids = ['floatingButton', 'div_save', 'word_floating'];

document.addEventListener('click', function (event) {
    // 選択されたテキストを取得
    let selectedText = window.getSelection().toString().trim();

    ids.forEach(id => {
        let myElement = document.getElementById(id);
        if (myElement && !myElement.contains(event.target)) myElement.remove();
    });

    console.log(`select: ${selectedText}`);
    if (selectedText.length > 0) {
        // ボタンを作成
        console.log("button created.");
        let button_popup = Object.assign(document.createElement('button'),
            {
                id: 'floatingButton',
                textContent: 'save',
                style: `position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;`
            }
        );

        button_popup.addEventListener('mousedown', function () {
            console.log('add new word');
            let div_save = Object.assign(document.createElement('div'),
                {
                    id: 'div_save',
                    className: 't div_category',
                    textContent: 'save',
                    style: `position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;`
                }
            );
            let desc = "my name is " + selectedText + ".";

            // 単語の説明
            let div_wordDesc = Object.assign(document.createElement('div'), {
                className: `t div_wordData`,
                textContent: desc,
            });
            div_save.appendChild(div_wordDesc);

            // 登録ボタン
            let bt_register = Object.assign(document.createElement('button'), {
                className: `t`,
                textContent: `add`,
            });
            bt_register.addEventListener('click', function () {
                let categoryName = 'new' // 最近追加された項目

                // 単語をwordListに追加、保存
                // 単語IDをcategoryに追加、保存
                chrome.storage.local.get({ wordList: [], categoryList: {} }, function (result) {
                    let wordList_new = result.wordList;
                    let categoryList_new = result.categoryList;
                    let word = {
                        uuid: uuidv4(),                           // 単語ID
                        name: selectedText,                       // 単語名
                        desc: desc,                               // 単語の説明文
                        timestamp: new Date().toISOString(),      // 追加日時
                    };

                    if (categoryList_new.hasOwnProperty(categoryName) == false) {
                        categoryList_new[categoryName] = [];
                    }
                    categoryList_new[categoryName].push(word.uuid);
                    wordList_new.push(word);
                    chrome.storage.local.set({ wordList: wordList_new, categoryList: categoryList_new }, function () {
                        console.log(`Saved: ${JSON.stringify(word)} into ${categoryName}.`);
                    });
                });
                div_save.remove();
            });
            div_save.appendChild(bt_register);

            button_popup.remove();
            document.body.appendChild(div_save);
        });
        document.body.appendChild(button_popup); // ボタンをドキュメントに追加
    }
});

document.addEventListener('click', function (event) {
});

// ページのスクロール時にボタンを削除
//不便だったのでスクロール時に削除しない
window.addEventListener('scroll', function () {
    //let existingButton = document.getElementById('floatingButton');
    //if (existingButton) {
    //    existingButton.remove();
    //}
});

function highlightText(node, wordList) {
    if (node.nodeType === Node.TEXT_NODE) {
        let pos_last = 0;
        let beforeIndices = [];
        let afterIndices = [];
        let highlightWordIndices = [];

        while (true) {
            console.log(node.textContent);
            let posList = wordList.map(word => {
                return node.textContent.indexOf(word.name, pos_last);
            });
            console.log(`posList: ${posList}`);               // 各単語を発見した最初の位置の配列
            if (posList.every(element => element < 0)) break; // すべて該当せず終了
            let indices = Array.from(posList.keys());         // インデックスの配列を作成
            indices.sort((a, b) => {                          // 位置に基づいてインデックスを並べ替え
                if (posList[a] < 0) {
                    return 1;
                } else if (posList[b] < 0) {
                    return -1;
                } else return posList[a] - posList[b];
            });
            let word = wordList[indices[0]];                  // 最初に発見した単語
            highlightWordIndices.push(indices[0]);
            beforeIndices.push(posList[indices[0]]);
            afterIndices.push(posList[indices[0]] + word.name.length);
            pos_last = posList[indices[0]] + word.name.length; // 検索位置の更新
        }
        // highlight要素を挿入
        let parent = node.parentNode;
        console.log(`highlightWordIndices: ${highlightWordIndices}`);
        console.log(`beforeIndices: ${beforeIndices}`);
        console.log(`afterIndices: ${afterIndices}`);

        if (highlightWordIndices.length != 0) {
            highlightWordIndices.forEach((index, i) => {
                let span = Object.assign(document.createElement('span'), {
                    className: 'highlight',
                    textContent: wordList[index].name,
                    onmouseenter: (event => {
                        let myElement = document.getElementById('word_floating');
                        if (myElement) myElement.remove();

                        let div_word = Object.assign(document.createElement('div'), {
                            className: `t div_word`,
                            textContent: null,
                            id: `word_floating`,
                            style: `position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;`,
                        });

                        // 単語名
                        let div_wordName = Object.assign(document.createElement('div'), {
                            className: `t div_wordName`,
                            textContent: wordList[index].name,
                        });
                        // div_word.appendChild(div_wordName);

                        // 単語の説明
                        let div_wordDesc = Object.assign(document.createElement('div'), {
                            className: `t div_wordData`,
                            textContent: wordList[index].desc,
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
                            bt_debugInfo.textContent = isClosed ? JSON.stringify(wordList[index]) : `debug info...`;
                            bt_debugInfo.isClosed = !isClosed;
                        });
                        div_word.appendChild(bt_debugInfo);
                        document.body.appendChild(div_word);
                    }),
                    //onmouseleave: (event => {
                    //    let div_word = document.getElementById('word_floating');
                    //    div_word.remove();
                    //}),
                });
                let before = node.textContent.slice(i <= 0 ? 0 : afterIndices[i - 1], beforeIndices[i]);
                let after = node.textContent.slice(afterIndices[i], i >= node.textContent.length - 1 ? node.textContent.length - 1 : beforeIndices[i + 1]);

                parent.insertBefore(document.createTextNode(before), node);
                parent.insertBefore(span, node);
                parent.insertBefore(document.createTextNode(after), node);
            });
            parent.removeChild(node);
        }
    } else {
        for (let i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].className !== 'highlight') {
                highlightText(node.childNodes[i], wordList);
            }
        }
    }
}

window.onload = function () {
    chrome.storage.local.get({ wordList: [] }, function (result) {
        highlightText(document.body, result.wordList);
    });
};

// メッセージをリッスン
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'yourLocalStorageKeyChanged') {
        // 関数を実行
        chrome.storage.local.get({ wordList: [] }, function (result) {
            highlightText(document.body, result.wordList);
        });
    }
});