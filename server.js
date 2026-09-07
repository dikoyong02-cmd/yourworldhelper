const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Render 설정의 Environment Variables에서 키를 가져옵니다.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', async (req, res) => {
  // systemInstruction, history를 프론트엔드에서 실제로 받아온다.
  // (기존 코드는 prompt만 받고 이 두 개를 버리고 있었음)
  const { prompt, systemInstruction, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '프롬프트 내용이 없습니다.' });
  }

  // OpenAI 호환 chat completions 형식의 messages 배열 구성:
  // [system] → [...이전 대화 히스토리] → [현재 사용자 메시지]
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  if (Array.isArray(history)) {
    // history는 프론트에서 { role: "user" | "assistant", content: "..." } 형태로 옴.
    // 이미 형식이 맞으므로 그대로 넣되, 방금 push한 마지막 user 메시지와
    // 중복되지 않도록 마지막 항목은 제외한다 (프론트에서 rawPrompt를 이미
    // history에 push한 뒤 보내고 있으므로).
    const trimmedHistory = history.slice(0, -1);
    for (const turn of trimmedHistory) {
      if (turn && turn.role && turn.content) {
        messages.push({ role: turn.role, content: turn.content });
      }
    }
  }

  messages.push({ role: 'user', content: prompt });

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
        messages: messages
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
