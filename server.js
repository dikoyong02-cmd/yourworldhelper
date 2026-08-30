const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  try {
    let { prompt } = req.body;
    const hfToken = process.env.HF_TOKEN;

    if (!prompt || prompt.trim() === '') {
      prompt = "스토리 설정 및 창작 구상을 자율적으로 작성해 줘.";
    }

    if (!hfToken) {
      return res.status(500).json({ error: 'HF_TOKEN 환경 변수가 설정되지 않았습니다.' });
    }

    // 무료 라우터에서 광범위하게 지원하는 Llama 3.2 모델로 교체
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-3B-Instruct",
          messages: [
            { role: "system", content: "당신은 스토리 기획 전문 AI 작가입니다. 마크다운 형식으로 풍부하고 깔끔하게 작성하세요." },
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
      return res.status(500).json({ error: data.error?.message || 'AI 생성 실패' });
    }

    const resultText = data.choices?.[0]?.message?.content || "결과를 생성할 수 없습니다.";
    res.json({ result: resultText });

  } catch (error) {
    console.error('Server Catch Error:', error);
    res.status(500).json({ error: 'AI 생성 처리 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
