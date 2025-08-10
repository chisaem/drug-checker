console.log('Server starting...');

// モジュールのインポート
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// 環境変数のロード
dotenv.config();

// Expressアプリの初期化
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(express.json()); // JSONリクエストボディをパースする
app.use(express.static(path.join(__dirname, '.'))); // 静的ファイル(html, css, js)を配信

// APIエンドポイントの作成
app.post('/api/check', async (req, res) => {
    console.log('POST /api/check received', req.body);

    const { drugName, opeDay } = req.body;

    if (!drugName || !opeDay) {
        return res.status(400).json({ error: '薬剤名と手術予定日が必要です。' });
    }

    const difyApiUrl = 'https://api.dify.ai/v1/workflows/run';
    const apiKey = process.env.DIFY_API_KEY;

    if (!apiKey) {
        console.error('DIFY_API_KEY is not set in .env file');
        return res.status(500).json({ error: 'サーバーエラー: APIキーが設定されていません。' });
    }

    const apiData = {
        inputs: {
            drug_name: drugName,
            ope_day: opeDay
        },
        response_mode: 'blocking',
        user: 'gemini-node-user'
    };

    try {
        console.log('Calling Dify API...');
        const difyResponse = await axios.post(difyApiUrl, apiData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Dify API call successful');
        // Difyからのレスポンスをそのままフロントエンドに返す
        res.json(difyResponse.data);

    } catch (error) {
        console.error('Error calling Dify API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Dify APIの呼び出し中にエラーが発生しました。' });
    }
});

// ルートへのGETリクエストでindex.htmlを返す
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// サーバーの起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
