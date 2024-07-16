let wordList = {};
let categoryList = {};
let userProfile = {};

function initialize() {
    chrome.storage.local.get({ wordList: {}, categoryList: {}, userProfile: {} }, function (result) {
        wordList = result.wordList;
        categoryList = result.categoryList;
        userProfile = result.userProfile;
        console.log(`loaded: \nwordList: ${JSON.stringify(wordList)}\ncategoryList: ${JSON.stringify(categoryList)}\nuserProfile: ${JSON.stringify(userProfile)}.`);

        let wordBook_body = document.getElementById('wordBook_body');
        Object.entries(categoryList).forEach(([id, category]) => {
            console.log(category);

            // カテゴリに属する単語を単語リストから抽出
            let wordList_ext = {};
            Object.entries(wordList).forEach(([word_id, word]) => {
                if (word.id_category === id) wordList_ext[`${word_id}`] = word;
            });

            // カテゴリ枠
            let bgColor_div_category = adjustHexColor(category.color, 0.5);
            let div_category = Object.assign(document.createElement('div'), {
                className: `t div_category`,
                textContent: category.name,
                style: `background-color: ${bgColor_div_category}; cursor: pointer;`,
                isCollapsed: false,
            });
            div_category.addEventListener("click", function () {
                // 折りたたみ状態に応じて表示/非表示を切り替える
                div_category.isCollapsed = !div_category.isCollapsed;

                // .div_word要素を取得して処理する
                let divCategoryElements = div_category.querySelectorAll('.div_word');
                divCategoryElements.forEach(element => {
                    element.style.display = div_category.isCollapsed ? 'none' : '';
                });
            });

            console.log(`${category.name}: ${JSON.stringify(wordList_ext)}.`);
            Object.entries(wordList_ext).forEach(([id, word]) => {
                // 単語枠
                let div_word = Object.assign(document.createElement('div'), {
                    className: `t div_word`,
                    textContent: null,
                    style: `background-color: ${category.color}`,
                });
                console.log(`name: ${word.name}, desc: ${word.desc}`);
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
                    delete wordList[`${id}`]; // wordListからwordを削除
                    chrome.storage.local.set({ wordList: wordList }, function () {
                        div_word.remove(); // 単語を除去
                    });
                });
                div_word.appendChild(bt_delete);

                div_category.appendChild(div_word);
            });
            wordBook_body.appendChild(div_category);
        });

        // 全削除ボタン
        let button_deleteAll = Object.assign(document.createElement('button'), {
            className: `t button_delete`,
            textContent: 'deleteAll',
        });
        button_deleteAll.addEventListener('click', function () {
            wordList = {};
            categoryList = {};
            chrome.storage.local.set({ wordList: wordList, categoryList: categoryList }, function () {
                // div_categoryをすべて削除
                let divCategoryElements = document.body.querySelectorAll('.div_category');
                divCategoryElements.forEach(element => {
                    element.remove();
                });
            });
        });
        wordBook_body.appendChild(button_deleteAll);

        // APIキー設定
        let div_apiKey = Object.assign(document.createElement('div'), {
            className: ``,
            style: `display: flex;`,
        });

        // APIキー入力フィールド
        let in_API_chatGPT = Object.assign(document.createElement('input'), {
            id: 'apiKeyInput',
            className: 't',
            type: 'text',
            placeholder: 'Enter your API key',
            value: userProfile['apiKey'] || '',
            style: `flex: 1 1 auto; overflow-x: scroll`,
        });
        div_apiKey.appendChild(in_API_chatGPT);

        // APIキー設定ボタン
        let button_API_chatGPT = Object.assign(document.createElement('button'), {
            className: `t`,
            textContent: `set`,
            style: `flex: 0 0 auto;`,
        });
        button_API_chatGPT.addEventListener('click', function () {
            userProfile.apiKey = in_API_chatGPT.value;
            chrome.storage.local.set({ userProfile: userProfile }, function () {
                console.log(`set new apiKey: ${userProfile.apiKey}`);
            });
        });
        div_apiKey.appendChild(button_API_chatGPT);

        wordBook_body.appendChild(div_apiKey);
    });
}

document.addEventListener('DOMContentLoaded', initialize);

// メッセージをリッスン
chrome.storage.onChanged.addListener((changes, namespace) => {
    try {
        chrome.storage.local.get({ wordList: {}, categoryList: {}, userProfile: {} }, function (result) {
            wordList = result.wordList;
            categoryList = result.categoryList;
            userProfile = result.userProfile;
            console.log(`loaded: \nwordList: ${JSON.stringify(wordList)}\ncategoryList: ${JSON.stringify(categoryList)}\nuserProfile: ${JSON.stringify(userProfile)}.`);
        });
    } catch (error) {
        console.error(error);
    }
});

function adjustHexColor(hex, percent) {
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function hexToRGB(hex) {
        // 先頭の#を取り除く
        hex = hex.replace('#', '');

        // 16進数の色コードをRGBに変換
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // RGBA形式で返す
        return [r, g, b];
    }
    let [r, g, b] = hexToRGB(hex);
    let [h, s, l] = rgbToHsl(r, g, b);

    if (percent > 0) {
        // 明るくする
        l += (1 - l) * percent;
    } else {
        // 暗くする
        l += l * percent;
    }

    // lの値を0から1の間に制限
    l = Math.max(0, Math.min(1, l));

    let [newR, newG, newB] = hslToRgb(h, s, l);
    return `rgb(${newR}, ${newG}, ${newB})`;
}