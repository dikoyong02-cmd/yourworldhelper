const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Render에 GEMINI_API_KEY가 설정되지 않았습니다." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // gemini-1.5-flash 모델 사용
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = req.body.prompt;
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        res.json({ result: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: error.message || "서버 처리 중 오류가 발생했습니다." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
