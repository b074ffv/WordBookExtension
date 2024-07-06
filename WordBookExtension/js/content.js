import { v4 as uuidv4 } from 'uuid';

document.addEventListener('click', function (event) {
    // 選択されたテキストを取得
    let selectedText = window.getSelection().toString().trim();

    // すでにボタンが存在する場合は削除
    let existingButton = document.getElementById('floatingButton');
    if (existingButton) {
        existingButton.remove();
    }
    console.log(`select: ${selectedText}`);
    if (selectedText.length > 0) {
        // ボタンを作成
        console.log("button created.");
        let button = Object.assign(document.createElement('button'),
            {
                id: 'floatingButton',
                textContent: 'save',
                style: `position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000;`
            }
        );

        button.addEventListener('mousedown', function () {
            let word = {
                uuid: uuidv4(),                           // 単語ID
                name: selectedText,                       // 単語名
                desc: "my name is " + selectedText + ".", // 単語の説明文
                timestamp: new Date().toISOString(),      // 追加日時
            };

            let categoryName = 'new' // 最近追加された項目

            // 単語をwordListに追加、保存
            // 単語IDをcategoryに追加、保存
            chrome.storage.local.get({ wordList: [], categoryList: {} }, function (result) {
                let wordList_new = result.wordList;
                let categoryList_new = result.categoryList;

                if (categoryList_new.hasOwnProperty(categoryName) == false) {
                    categoryList_new[categoryName] = [];
                }
                categoryList_new[categoryName].push(word.uuid);
                wordList_new.push(word);
                chrome.storage.local.set({ wordList: wordList_new, categoryList: categoryList_new }, function () {
                    console.log(`Saved: ${JSON.stringify(word)} into ${categoryName}.`);
                });
            });

            button.remove();
        });
        document.body.appendChild(button); // ボタンをドキュメントに追加
    }
});

// ページのスクロール時にボタンを削除
//不便だったのでスクロール時に削除しない
window.addEventListener('scroll', function () {
    //let existingButton = document.getElementById('floatingButton');
    //if (existingButton) {
    //    existingButton.remove();
    //}
});
