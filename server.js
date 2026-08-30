const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Render 설정의 Environment Variables에서 키를 가져옵니다.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '프롬프트 내용이 없습니다.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // 정상 동작하는 무료 Llama 모델 사용
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (response.ok && data.choices) {
      return res.json({ result: data.choices[0].message.content });
    } else {
      const errorMsg = data.error?.message || 'AI 답변 생성에 실패했습니다.';
      return res.status(response.status).json({ error: errorMsg });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
