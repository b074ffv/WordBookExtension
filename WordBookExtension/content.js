document.addEventListener('click', function (event) {
    // 選択されたテキストを取得
    let selectedText = window.getSelection().toString().trim();

    // すでにボタンが存在する場合は削除
    let existingButton = document.getElementById('floatingButton');
    if (existingButton) {
        existingButton.remove();
    }

    if (selectedText.length > 0) {
        // ボタンを作成
        //console.log("button created.");
        let button = document.createElement('button');
        button.id = 'floatingButton';
        button.textContent = `save: ${selectedText}`;
        button.style.position = 'absolute';
        button.style.top = `${event.pageY}px`; //クリック時のマウスのY座標
        button.style.left = `${event.pageX}px`; //クリック時のマウスのX座標
        button.style.zIndex = 1000;
        // ボタンをクリックしたときの動作を設定
        button.addEventListener('mousedown', function () {
            //console.log("selected: " + selectedText);
            button.remove();
            chrome.storage.local.get({ savedTexts: [] }, function (result) {
                let savedTexts = result.savedTexts;
                savedTexts.push(selectedText);
                chrome.storage.local.set({ savedTexts: savedTexts }, function () {
                    console.log(`Saved: ${selectedText}`);
                });
            });
        });

        // ボタンをドキュメントに追加
        document.body.appendChild(button);
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
