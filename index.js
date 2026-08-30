const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Gemini API 설정 (환경변수 GEMINI_API_KEY 사용)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        // gemini-1.5-flash 또는 사용 중이신 모델명 지정
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ result: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: error.message || "API 요청 실패" });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

