const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// app.post('/generate', ...) 부분 내부
app.post('/generate', async (req, res) => {
  // 프론트엔드에서 넘어오는 값 (사이트에 따라 변수명이 다를 수 있음)
  const { hf_token, prompt } = req.body; 

  if (!hf_token || !prompt) {
    return res.status(400).json({ error: 'API 토큰과 프롬프트를 입력해 주세요.' });
  }

  try {
    // OpenRouter API 엔드포인트 호출
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hf_token}`, // OpenRouter API 키 입력
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://render.com', // 배포 사이트 URL
        'X-Title': 'My Story Generator'
      },
      body: JSON.stringify({
        // OpenRouter에서 지원하는 무료 또는 원하시는 모델명 지정
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

    // 결과 응답 보내기
    res.json({ result: data.choices[0].message.content });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
