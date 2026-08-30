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

    // 입력값이 비어있거나 부족할 때 적용되는 완전 기본용 프롬프트
    if (!prompt || prompt.trim() === '') {
      prompt = "입력된 세부 요구사항이 없습니다. 매력적인 판타지 세계관과 등장인물 설정을 자율적으로 생성해 주세요.";
    }

    if (!hfToken) {
      return res.status(500).json({ error: 'HF_TOKEN 환경 변수가 설정되지 않았습니다.' });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [
            { role: "system", content: "당신은 웹소설 및 창작자를 돕는 스토리 기획 전문 AI 작가입니다. 사용자 요청에 맞춰 깔끔한 마크다운(Markdown) 서식으로 응답하세요." },
            { role: "user", content: prompt }
          ],
          max_tokens: 700,
          temperature: 0.7
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API 반환 에러:', data);
      return res.status(500).json({ error: data.error?.message || 'AI 생성 실패' });
    }

    const resultText = data.choices?.[0]?.message?.content || "결과를 생성할 수 없습니다.";
    res.json({ result: resultText });

  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: 'AI 생성 처리 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
