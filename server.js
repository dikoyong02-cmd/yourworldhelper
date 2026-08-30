const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', async (req, res) => {
  const { hf_token, prompt } = req.body; 

  if (!hf_token || !prompt) {
    return res.status(400).json({ error: 'API 토큰과 프롬프트를 입력해 주세요.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hf_token}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://render.com',
        'X-Title': 'My Story Generator'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free', 
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenRouter 요청 실패');
    }

    res.json({ result: data.choices[0].message.content });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 서버 실행 구문 (누락되었던 부분)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
