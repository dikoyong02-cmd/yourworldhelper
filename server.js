const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Gemini API 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY 설정이 필요합니다.' });
    }

    // Gemini 1.5 Flash 모델 사용
    const model = genAI.getGenerativeAIModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `
당신은 웹소설 및 스토리 기획을 돕는 전문 AI 보조작가입니다.
입력된 프롬프트와 지침을 바탕으로 가독성이 뛰어난 마크다운(Markdown) 서식으로 완성된 소설/세계관 설정 및 대사를 출력해 주세요.
프롬프트 내용이나 지침 태그([지침: ...], [메인 카테고리: ...] 등)를 그대로 복사해서 출력하지 말고, 오직 완성된 최종 마크다운 스토리 결과물만 출력하세요.
    `;

    const result = await model.generateContent([systemInstruction, prompt]);
    const responseText = result.response.text();

    res.json({ result: responseText });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'AI 생성 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
