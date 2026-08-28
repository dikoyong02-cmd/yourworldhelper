const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 엔드포인트
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
        return res.status(400).json({ error: '프롬프트 내용이 필요합니다.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`Gemini API 오류: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        res.json({ result: text });
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ error: '서버 처리 중 오류가 발생했습니다.' });
    }
});

// 메인 페이지 제공
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`서버 작동 중: PORT ${PORT}`);
});
