const ids = ['floatingButton', 'div_save', 'word_floating'];

let wordList = {};
let categoryList = {};
let userProfile = {};

if (typeof browser === "undefined") {
    var browser = chrome;
}
document.addEventListener('click', function (event) {
    let selection = window.getSelection();
    let selectedText = selection.toString().trim(); // 選択されたテキストを取得

    ids.forEach(id => {
        let myElement = document.getElementById(id);

        if (myElement && !myElement.contains(event.target)) {
            myElement.remove();
            return;
        }
    });

    if (selectedText.length > 0) {
        // ボタンを作成
        console.log(`select: ${selectedText}`);
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
                    className: 't div_word',
                    textContent: null,
                    style: `position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000; width: 16rem; overflow: auto;`
                }
            );

            let div_wordName = Object.assign(document.createElement('div'), {
                className: `t div_wordName`,
                textContent: selectedText,
                style: ``,
            });
            div_save.appendChild(div_wordName);

            // 単語の説明
            let div_wordDesc = Object.assign(document.createElement('div'), {
                className: `t div_wordData`,
                style: ``,
            });
            div_save.appendChild(div_wordDesc);

            // chatGPTによる単語説明の生成
            (async function () {
                div_wordDesc.textContent = 'Generating response...';

                // コンテキストを取得
                let context = getSelectionWithContext(selection, 20);
                let prompt = `単語:${selectedText} 文章:...${context}...`;

                try {
                    // ChatGPT からの応答を待機
                    div_wordDesc.textContent = await getChatResponse(prompt);
                } catch (error) {
                    // エラー処理
                    div_wordDesc.textContent = 'Error generating response';
                    console.error('Error:', error);
                }
            })();

            // 設定枠
            let div_register = Object.assign(document.createElement('div'), {
                className: ``,
                style: `display: flex; justify-content: flex-end;`,
            });

            // カテゴリ設定メニュー
            let sel_category = Object.assign(document.createElement('select'), {
                className: `t`,
                style: `flex: 1 1 auto; overflow-x: auto;`,
            });

            // カテゴリを読み込む関数
            function reload_sel_category() {
                sel_category.innerHTML = '';
                Object.entries(categoryList).forEach(([id, category]) => {
                    let option = Object.assign(document.createElement('option'), {
                        value: id,
                        textContent: category.name,
                    });
                    if (option.value != 'new') sel_category.appendChild(option);
                })
                // 新規作成オプション
                let op_newCategory = Object.assign(document.createElement('option'), {
                    className: `t`,
                    textContent: `new category`,
                    value: 'new',
                });
                sel_category.appendChild(op_newCategory);
                update_div_save();
            }

            // 登録ボタン
            let bt_register = Object.assign(document.createElement('button'), {
                className: `t`,
                textContent: `add`,
                style: `flex: 0 0 auto;`,
            });
            function update_div_save() {
                if (sel_category.value === 'new') {
                    bt_register.textContent = 'create';
                    div_save.style.backgroundColor = '';
                }
                else {
                    bt_register.textContent = 'add';
                    div_save.style.backgroundColor = categoryList[sel_category.value].color;
                }
            }
            sel_category.addEventListener("change", update_div_save);
            div_register.appendChild(sel_category);

            // カテゴリ読み込み
            reload_sel_category();

            // カテゴリ作成枠(最初は非表示)
            let div_newCategory = Object.assign(document.createElement('div'), {
                className: ``,
                style: `display: flex; flex-direction: column;`,
            });
            div_newCategory.style.display = 'none';

            // 1行目
            div_col_01 = Object.assign(document.createElement('div'), {
                style: `display: flex; align-items: center; width: 100%;`,
            });

            // カテゴリ名入力フィールド
            let in_newCategory = Object.assign(document.createElement('input'), {
                className: 't',
                type: 'text',
                placeholder: 'category name',
                style: `flex: 1 1 auto; overflow-x: scroll`,
            });
            div_col_01.appendChild(in_newCategory);

            // 背景色を表示するための要素
            let div_colorDisplay = Object.assign(document.createElement('div'), {
                className: 't',
                style: `flex: 0 0 auto; width: 2rem; height: 2rem; opacity: 1; z-index: 0; padding: 0rem;`,
            });
            div_col_01.appendChild(div_colorDisplay);

            // カテゴリカラー設定
            let col_newCategory = Object.assign(document.createElement('input'), {
                className: 't',
                type: 'color',
                style: `width: 100%; height: 100%; opacity: 0; z-index: 1; margin: 0rem; padding: 0rem`,
            });
            col_newCategory.addEventListener("change", function () {
                div_colorDisplay.style.backgroundColor = col_newCategory.value;
            });
            div_colorDisplay.appendChild(col_newCategory);
            div_newCategory.appendChild(div_col_01);

            div_colorDisplay.style.backgroundColor = col_newCategory.value;

            // 2行目
            let div_error = Object.assign(document.createElement('div'), {
                className: ``,
                textContent: ``,
                style: `color: red;text-align: center;display: flex;width: 100%; justify-content: center; font-size: 80%`,
            });
            div_newCategory.appendChild(div_error);

            // 3行目
            let div_col_03 = Object.assign(document.createElement('div'), {
                style: `display: flex; align-items: center; justify-content: flex-end; width: 100%;`,
            });

            // キャンセルボタン
            let bt_cancel = Object.assign(document.createElement('button'), {
                className: `t`,
                textContent: `cancel`,
                style: ``,
            });
            bt_cancel.addEventListener("click", function () {
                reload_sel_category();
                div_register.style.display = 'flex';
                div_newCategory.style.display = 'none';
            });
            div_col_03.appendChild(bt_cancel);

            // 作成ボタン
            let bt_makeCategory = Object.assign(document.createElement('button'), {
                className: `t`,
                textContent: `create`,
                style: ``,
            });
            bt_makeCategory.addEventListener('click', function () {
                if (Object.values(categoryList).find(category => category.name === in_newCategory.value)) {
                        div_error.textContent = 'this category already exists';
                    div_error.style.display = 'flex';
                }
                else if (in_newCategory.value === '') {
                    div_error.textContent = 'category name is empty';
                    div_error.style.display = 'flex';
                }
                else {
                    div_error.style.display = 'none';
                    // 新規カテゴリ作成
                    categoryList[`${generateRandomID(8)}`] = {
                        name: in_newCategory.value,
                        color: col_newCategory.value,
                    };
                    reload_sel_category();
                    browser.storage.local.set({ categoryList: categoryList }, function () {
                        console.log(`created new category`);
                    });
                    div_register.style.display = 'flex';
                    div_newCategory.style.display = 'none';
                }
            });
            div_col_03.appendChild(bt_makeCategory);

            div_newCategory.appendChild(div_col_03);

            div_save.appendChild(div_newCategory);

            function addNewWord() {
                // 新しいカテゴリの作成   
                if (sel_category.value === 'new') {
                    console.log("create new category");
                    div_register.style.display = 'none';
                    div_newCategory.style.display = 'flex';
                }
                // 新しい単語の作成
                else {
                    console.log("add new word");
                    let id = generateRandomID(8); // 単語ID
                    wordList[`${id}`] = {
                        name: selectedText, // 単語名
                        desc: div_wordDesc.textContent, // 単語の説明文
                        timestamp: new Date().toISOString(), // 追加日時
                        id_category: sel_category.value // カテゴリID
                    };

                    // ストレージの更新
                    console.log(`wordList: ${JSON.stringify(wordList)}`);
                    browser.storage.local.set({ wordList: wordList}, function () {
                        console.log(`added new word`);
                    });

                    bt_register.removeEventListener('click', addNewWord);
                    bt_register.textContent = 'saved';
                    sel_category.style.display = 'none';
                }
            };
            bt_register.addEventListener('click', addNewWord);

            div_register.appendChild(bt_register);
            div_save.appendChild(div_register);
            document.body.appendChild(div_save);

            button_popup.remove();

            // 選択範囲の解除
            if (selection.removeAllRanges) {
                selection.removeAllRanges();
            } else if (selection.empty) {
                selection.empty();
            }
        });
        document.body.appendChild(button_popup); // ボタンをドキュメントに追加
    }
});

// ページのスクロール時にボタンを削除(無効中)
//window.addEventListener('scroll', function () {
//    let existingButton = document.getElementById('floatingButton');
//    if (existingButton) {
//        existingButton.remove();
//    }
//});

function highlightText(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let pos_last = 0;
        let beforeIndices = [];
        let afterIndices = [];
        let highlightWordIndices = [];
        let parent = node.parentNode;

        // 単語の検索結果のリスト作成
        while (true) {
            //console.log(node.textContent);
            let posList = Object.values(wordList).map(word => {
                return node.textContent.indexOf(word.name, pos_last);
            });
            //console.log(`posList: ${posList}`); // 各単語を発見した最初の位置の配列

            // 検索終了
            if (posList.every(element => element < 0)) break;

            // 位置に基づいてインデックスを並べ替え
            let indices = Array.from(posList.keys()); // インデックスの配列
            indices.sort((a, b) => {
                if (posList[a] < 0) {
                    return 1;
                } else if (posList[b] < 0) {
                    return -1;
                } else return posList[a] - posList[b];
            });
            let word = Object.values(wordList)[indices[0]]; // 最初に発見した単語
            let index_word = indices[0] // 最初に発見した単語のwordListでのインデックス

            highlightWordIndices.push(index_word);
            beforeIndices.push(posList[index_word]);
            afterIndices.push(posList[index_word] + word.name.length);
            pos_last = posList[index_word] + word.name.length; // 検索位置の更新
        }

        // highlight要素の作成
        if (highlightWordIndices.length != 0) {
            let spans = Object.values(wordList).map(word => {
                let color_word = categoryList[`${word.id_category}`].color;
                let span = Object.assign(document.createElement('span'), {
                    className: 'highlight',
                    textContent: word.name,
                    style: `text-decoration-color: ${color_word}`,
                    onmouseenter: (event => {
                        let myElement = document.getElementById('word_floating');
                        if (myElement) myElement.remove();

                        let div_word = Object.assign(document.createElement('div'), {
                            className: `t div_word`,
                            textContent: '',
                            id: `word_floating`,
                            style: `position: absolute; top: ${event.pageY}px; left: ${event.pageX}px; z-index: 1000; background-color: ${color_word}`,
                        });

                        // 単語名
                        let div_wordName = Object.assign(document.createElement('div'), {
                            className: `t div_wordName`,
                            textContent: word.name,
                        });
                        // div_word.appendChild(div_wordName);

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
                        document.body.appendChild(div_word);
                    }),
                });
                return (span);
            });

            // highlight要素の挿入
            highlightWordIndices.forEach((index, i) => {
                if (i == 0) {
                    let before = node.textContent.slice(0, beforeIndices[i])
                    parent.insertBefore(document.createTextNode(before), node);
                }
                let after = node.textContent.slice(afterIndices[i], i >= node.textContent.length - 1 ? node.textContent.length - 1 : beforeIndices[i + 1]);
                parent.insertBefore(spans[index], node);
                parent.insertBefore(document.createTextNode(after), node);
            });
            parent.removeChild(node);
        }
    } else {
        // 子要素の探索
        for (let i = 0; i < node.childNodes.length; i++) {
            if (node.childNodes[i].className !== 'highlight') {
                highlightText(node.childNodes[i], wordList);
            }
        }
    }
}

// ロード完了時に実行
window.onload = function () {
    console.log('window.onload');

    try {
        browser.storage.local.get({ wordList: {}, categoryList: {}, userProfile: {} }, function (result) {
            wordList = result.wordList;
            categoryList = result.categoryList;
            userProfile = result.userProfile;
            console.log(`loaded: \nwordList: ${JSON.stringify(wordList)}\ncategoryList: ${JSON.stringify(categoryList)}\nuserProfile: ${JSON.stringify(userProfile)}.`);
            highlightText(document.body, wordList);
        });
    } catch (error) {
        console.error(error);
    }
};

// メッセージをリッスン
browser.storage.onChanged.addListener((changes, namespace) => {
    try {
        browser.storage.local.get({ wordList: {}, categoryList: {}, userProfile: {} }, function (result) {
            wordList = result.wordList;
            categoryList = result.categoryList;
            userProfile = result.userProfile;
            console.log(`loaded: \nwordList: ${JSON.stringify(wordList)}\ncategoryList: ${JSON.stringify(categoryList)}\nuserProfile: ${JSON.stringify(userProfile)}.`);
            highlightText(document.body, wordList);
        });
    } catch (error) {
        console.error(error);
    }
});

// ChatGPT API
async function getChatResponse(prompt) {
    let reply = '';

    console.log(`prompt: ${prompt}`);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userProfile['apiKey']}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: '文章における単語の解説をしてください。解説は日本語で一文にして簡潔に述べてください。'},
                    { role: 'user', content: prompt },
                ],
            })
        });

        const data = await response.json();
        if (data.choices) reply = data.choices[0].message.content;
        else reply = JSON.stringify(data);
        console.log(`reply: ${reply}`);
    } catch (error) {
        console.error(`Error: ${error}`);
        reply = error;
    }
    return(reply);
}


// 選択文字列の前後を連結
function getSelectionWithContext(selection, contextLength) {
    if (selection.rangeCount === 0) {
        return null;
    }

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    const endNode = range.endContainer;

    if (startNode !== endNode || startNode.nodeType !== Node.TEXT_NODE) {
        return null; // 複数のノードが選択されている場合や、選択範囲がテキストノードでない場合
    }

    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const fullText = startNode.textContent;

    const contextStart = Math.max(0, startOffset - contextLength);
    const contextEnd = Math.min(fullText.length, endOffset + contextLength);

    return fullText.slice(contextStart, contextEnd);
}

// ランダムな文字列IDの生成
function generateRandomID(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function blendWithWhite(color, percentage) {
    // 色をRGB成分に分解
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    // 各成分を白色に近づける
    r = Math.round(r + percentage * (255 - r));
    g = Math.round(g + percentage * (255 - g));
    b = Math.round(b + percentage * (255 - b));

    // 新しい色を16進数に変換
    let newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return newColor;
}

function lightenColor(rgbColor, percent) {
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

    let [r, g, b] = rgbColor;
    let [h, s, l] = rgbToHsl(r, g, b);

    l += (1 - l) * (percent / 100);
    l = Math.min(1, l); // lの値を1以下に制限

    let [newR, newG, newB] = hslToRgb(h, s, l);
    return [newR, newG, newB];
}

function hexToRGB(hex) {
    // 先頭の#を取り除く
    hex = hex.replace('#', '');

    // 16進数の色コードをRGBに変換
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // RGBA形式で返す
    return `rgb(${r}, ${g}, ${b})`;
}