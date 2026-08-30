const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      console.error('HF_TOKEN 미설정');
      return res.status(500).json({ error: 'HF_TOKEN 환경 변수가 설정되지 않았습니다.' });
    }

    // Hugging Face 최신 Router URL 사용
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            { role: "system", content: "당신은 스토리 기획 전문 AI 작가입니다. 마크다운 형식으로 답변하세요." },
            { role: "user", content: prompt }
          ],
          max_tokens: 700,
          temperature: 0.7
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      return res.status(500).json({ error: data.error?.message || 'AI 응답 생성 실패' });
    }

    const resultText = data.choices[0]?.message?.content || "결과를 생성할 수 없습니다.";
    res.json({ result: resultText });

  } catch (error) {
    console.error('Server Catch Error:', error);
    res.status(500).json({ error: 'AI 생성 처리 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
