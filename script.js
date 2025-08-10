console.log('script.js loaded');

// DOM要素の取得
const drugForm = document.getElementById('drug-form');
const drugNameInput = document.getElementById('drug-name');
const opeDayInput = document.getElementById('ope-day');
const resultList = document.getElementById('result-list');
const checkButton = document.getElementById('check-button');
const loading = document.getElementById('loading');

// バックエンドAPIのエンドポイント
const backendApiUrl = '/api/check';

// フォーム送信時のイベントリスナー
drugForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // デフォルトのフォーム送信をキャンセル

    // 入力値の取得
    const drugName = drugNameInput.value;
    const opeDay = opeDayInput.value;

    console.log('Form submitted with:', { drugName, opeDay });

    if (!drugName || !opeDay) {
        alert('薬剤名と手術予定日を入力してください。');
        return;
    }

    // ボタンとローディング表示の切り替え
    checkButton.disabled = true;
    checkButton.textContent = '確認中...';
    loading.classList.remove('hidden');
    resultList.innerHTML = ''; // 前回の結果をクリア

    // バックエンドに送信するデータ
    const requestData = { drugName, opeDay };

    console.log('Sending data to backend server:', JSON.stringify(requestData, null, 2));

    try {
        // バックエンドAPIへのリクエスト送信
        const response = await fetch(backendApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('Backend API response status:', response.status);

        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || `APIエラー: ${response.status}`);
        }

        const result = await response.json();
        console.log('Received data from backend:', result);

        // バックエンド経由で取得したDifyからのレスポンスを処理
        // 正常なレスポンス構造を仮定: result.data.outputs.text
        if (result && result.data && result.data.outputs && result.data.outputs.text) {
            const outputText = result.data.outputs.text;
            console.log('Extracted text from Dify response:', outputText);

            // 結果をリストに表示
            const listItem = document.createElement('li');
            listItem.textContent = outputText;
            resultList.appendChild(listItem);
        } else {
            throw new Error('Difyからのレスポンス形式が正しくありません。');
        }

    } catch (error) {
        console.error('Error during backend API call:', error);
        const errorItem = document.createElement('li');
        errorItem.textContent = `エラーが発生しました。
${error.message}`;
        errorItem.style.color = 'red';
        resultList.appendChild(errorItem);
    } finally {
        // ボタンとローディング表示を元に戻す
        checkButton.disabled = false;
        checkButton.textContent = '確認する';
        loading.classList.add('hidden');
    }
});
