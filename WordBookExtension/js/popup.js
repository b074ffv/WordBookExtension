let wordList = {};
let categoryList = {};
let userProfile = {};
const pattern_judge = { normal: '💁‍♂️', correct: '🙆‍♂️', wrong: '🙅‍♂️', perfect: '🥇', great: '🥈', good: '🥉', bad: '🪦' };
function initialize() {
    chrome.storage.local.get({ wordList: {}, categoryList: {}, userProfile: {} }, function (result) {
        wordList = result.wordList;
        categoryList = result.categoryList;
        userProfile = result.userProfile;
        console.log(`loaded: \nwordList: ${JSON.stringify(wordList)}\ncategoryList: ${JSON.stringify(categoryList)}\nuserProfile: ${JSON.stringify(userProfile)}.`);

        let wordBook_body = Object.assign(document.createElement('div'), {
            id: `wordBook_body`,
        });

        // 単語テスト枠
        let div_VocabTest = Object.assign(document.createElement('div'), {
            className: `t div_category`,
            textContent: '単語テスト',
            style: `text-align: center; display: flex; flex-direction: column;`,
        });
        // テスト開始ボタン枠
        let div_startVocabTest = Object.assign(document.createElement('div'), {
            className: `t div_word`,
            style: `display: flex;`,
        });
        // カテゴリ選択
        let sel_startVocabTest_category = Object.assign(document.createElement('select'), {
            className: `t`,
            id: 'sel_startVocabTest_category',
            style: `flex: 1 1 auto; overflow-x: auto;`,
        });
        // 開始ボタン
        let bt_startVocabTest = Object.assign(document.createElement('button'), {
            className: `t`,
            textContent: 'start',
            style: `flex: 0 0 auto;`,
        });
        function reload_sel_startVocabTest_category() {
            sel_startVocabTest_category.innerHTML = '';
            Object.entries(categoryList).forEach(([id, category]) => {
                let option = Object.assign(document.createElement('option'), {
                    value: id,
                    textContent: category.name,
                });
                if (option.value != 'new') sel_startVocabTest_category.appendChild(option);
            })
            // すべてのカテゴリから出題する設定
            let op_allCategory = Object.assign(document.createElement('option'), {
                className: `t`,
                textContent: `all category`,
                value: 'all',
            });
            sel_startVocabTest_category.appendChild(op_allCategory);
        }
        reload_sel_startVocabTest_category();
        // テスト開始
        bt_startVocabTest.addEventListener("click", function () {
            startTest(sel_startVocabTest_category.value);
        });

        div_startVocabTest.appendChild(sel_startVocabTest_category);
        div_startVocabTest.appendChild(bt_startVocabTest);
        div_VocabTest.appendChild(div_startVocabTest);
        wordBook_body.appendChild(div_VocabTest);

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
            div_category.addEventListener("click", function (event) {
                if (event.target == div_category) {
                    // 折りたたみ状態に応じて表示/非表示を切り替える
                    div_category.isCollapsed = !div_category.isCollapsed;

                    // .div_word要素を取得して処理する
                    let divCategoryElements = div_category.querySelectorAll('.div_word');
                    divCategoryElements.forEach(element => {
                        element.style.display = div_category.isCollapsed ? 'none' : '';
                    });
                }
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
                let divCategoryElements = wordBook_body.querySelectorAll('.div_category');
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
        document.body.appendChild(wordBook_body);
    });
}

document.addEventListener('DOMContentLoaded', initialize);

// 単語テスト
function startTest(id_category) {
    // 単語帳を非表示
    let wordBook_body = document.getElementById(`wordBook_body`);
    wordBook_body.style.display = 'none';
    let color_theme = id_category === 'all' ? '#98CEE4' : categoryList[id_category].color;
    // 出題される単語の抽出
    let wordList_ext = {};
    if (id_category == 'all') wordList_ext = wordList;
    else {
        Object.entries(wordList).forEach(([word_id, word]) => {
            if (word.id_category === id_category) wordList_ext[`${word_id}`] = word;
        });
    }

    // 単語テストbody
    let vocabTest_body = Object.assign(document.createElement('div'), {
        id: `vocabTest_body`,
    });

    // 単語テスト枠
    let div_VocabTest = Object.assign(document.createElement('div'), {
        style: `display: flex; flex-direction: column;`,
    });

    // 単語テストメニュー枠
    let div_vocabTestMenu = Object.assign(document.createElement('div'), {
        style: `display: flex;`,
    });
    // 単語テスト終了ボタン
    let div_quitVocabTest = Object.assign(document.createElement('button'), {
        className: `t button_delete`,
        textContent: `quit`,
        style: `flex: 0 0 auto;`,
    });
    div_quitVocabTest.addEventListener('click', function () {
        wordBook_body.style.display = '';
        vocabTest_body.remove();
    });

    // 単語テストタイトル
    let div_VocabTestTitle = Object.assign(document.createElement('div'), {
        className: `t div_category`,
        textContent: `単語テスト: ${id_category === 'all' ? 'all category' : categoryList[id_category].name}`,
        style: `flex: 1 1 auto; overflow-x: hidden; text-align: center; background-color: ${color_theme}`,
    });

    // 問題文
    let div_VocabTestQuestions = Object.assign(document.createElement('div'), {
        className: `t`,
        textContent: ``,
    });

    // テストの結果
    let div_vocabTestResult = Object.assign(document.createElement('div'), {
        className: `t`,
        textContent: ``,
        style: `font-size: 200%; text-align: center; height: 200%`,
    });

    // ジャッジ
    let div_vocabTestJudgeman = Object.assign(document.createElement('div'), {
        className: ``,
        textContent: pattern_judge['normal'],
        style: `font-size: 400%; text-align: center;`,
    });

    // 残り時間表示
    let div_vocabTestTimeLeft = Object.assign(document.createElement('div'), {
        className: ``,
        textContent: '',
        counter: "●",
        style: `font-size: 200%; text-align: center; justify-content: center; color: ${color_theme}`,
    });

    // 入力枠
    let in_vocabTestInput = Object.assign(document.createElement('input'), {
        className: 't',
        type: 'text',
        placeholder: 'answer',
        style: `text-align: center;`,
        readOnly: false,
    });

    let num_correct = 0; // 正答数
    let ids = shuffleArray(Object.keys(wordList_ext)); // 出題される単語ID
    let index_id_now = 0; // 現在の問題
    let timer, interval; // タイマー
    let timeLeft = 10; // 残り時間

    // 問題出題
    function showQuestion() {
        if (index_id_now < ids.length) {
            let word_answer = wordList_ext[`${ids[index_id_now]}`];
            div_VocabTestQuestions.innerHTML = makeQuestion(word_answer.desc, word_answer.name, color_theme);
            div_vocabTestResult.style.display = 'none';
            div_vocabTestJudgeman.textContent = pattern_judge['normal'];
            in_vocabTestInput.value = '';
            timeLeft = 10;
            div_vocabTestTimeLeft.textContent = div_vocabTestTimeLeft.counter.repeat(timeLeft);
            in_vocabTestInput.readOnly = false;
            startTimer();
        } else {
            showResult();
        }
    }

    // 正誤判定
    function checkAnswer() {
        if (in_vocabTestInput.value == wordList_ext[ids[index_id_now]].name) {
            let word_answer = wordList_ext[`${ids[index_id_now]}`];
            clearTimeout(timer);
            clearInterval(interval);
            in_vocabTestInput.readOnly = true;
            div_VocabTestQuestions.innerHTML = makeAnswer(word_answer.desc, word_answer.name, color_theme);
            div_vocabTestJudgeman.textContent = pattern_judge['correct'];
            num_correct++;
            index_id_now++;
            setTimeout(showQuestion, 3000);
        }
    }
    in_vocabTestInput.addEventListener("change", checkAnswer);

    // 結果発表
    function showResult() {
        div_VocabTestQuestions.style.display = 'none';
        in_vocabTestInput.style.display = 'none';
        div_vocabTestTimeLeft.style.display = 'none';
        div_vocabTestResult.textContent = `Score: ${num_correct} / ${ids.length}`;
        div_vocabTestResult.style.display = '';

        let correctRate = num_correct / ids.length;
        if (correctRate >= 1.0) div_vocabTestJudgeman.textContent = pattern_judge['perfect'];
        else if (correctRate >= 0.75) div_vocabTestJudgeman.textContent = pattern_judge['great'];
        else if (correctRate >= 0.5) div_vocabTestJudgeman.textContent = pattern_judge['good'];
        else div_vocabTestJudgeman.textContent = pattern_judge['bad'];
    }

    div_vocabTestMenu.appendChild(div_quitVocabTest);
    div_vocabTestMenu.appendChild(div_VocabTestTitle);
    vocabTest_body.appendChild(div_vocabTestMenu);
    div_VocabTest.appendChild(div_VocabTestQuestions);
    div_VocabTest.appendChild(div_vocabTestResult);
    div_VocabTest.appendChild(div_vocabTestJudgeman);
    div_VocabTest.appendChild(div_vocabTestTimeLeft);
    div_VocabTest.appendChild(in_vocabTestInput);
    vocabTest_body.appendChild(div_VocabTest);
    document.body.appendChild(vocabTest_body);

    // 初期化
    showQuestion();

    function makeAnswer(text, answer, color) {
        const regex = new RegExp(answer, 'gi'); // キーワードにマッチする正規表現を作成（大文字小文字を区別しない）
        const replacedText = text.replace(regex, `<span style="color: ${color};">${answer}</span>`);
        return replacedText;
    }

    function makeQuestion(text, answer, color) {
        const regex = new RegExp(answer, 'gi'); // キーワードにマッチする正規表現を作成（大文字小文字を区別しない）
        const replacedText = text.replace(regex, `<span style="color: ${color};">${'■'.repeat(answer.length) }</span>`);
        return replacedText;
    }

    // タイマー
    function startTimer() {
        // 時間切れ
        timer = setTimeout(() => {
            let word_answer = wordList_ext[`${ids[index_id_now]}`];
            div_vocabTestJudgeman.textContent = pattern_judge['wrong'];
            clearTimeout(timer);
            clearInterval(interval);
            in_vocabTestInput.readOnly = true;
            in_vocabTestInput.value = word_answer.name;
            div_VocabTestQuestions.innerHTML = makeAnswer(word_answer.desc, word_answer.name, color_theme);
            div_vocabTestTimeLeft.textContent = '';
            index_id_now++;
            setTimeout(showQuestion, 3000);
        }, timeLeft * 1000);

        interval = setInterval(() => {
            timeLeft--;
            div_vocabTestTimeLeft.textContent = div_vocabTestTimeLeft.counter.repeat(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    // ランダム化
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // 要素を交換
        }
        return array;
    }
}

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