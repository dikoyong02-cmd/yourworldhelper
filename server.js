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

    // Hugging Face Direct Serverless Inference API 호출
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `<|im_start|>system\n당신은 스토리 기획 전문 AI 작가입니다. 마크다운 형식으로 작성하세요.<|im_end|>\n<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n`,
          parameters: {
            max_new_tokens: 700,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Response:', data);
      return res.status(500).json({ error: data.error || 'AI 응답 생성 실패' });
    }

    let resultText = "";
    if (Array.isArray(data) && data.length > 0) {
      resultText = data[0].generated_text;
    } else if (data.generated_text) {
      resultText = data.generated_text;
    } else {
      resultText = "결과를 생성할 수 없습니다.";
    }

    res.json({ result: resultText });

  } catch (error) {
    console.error('Server Catch Error:', error);
    res.status(500).json({ error: 'AI 생성 처리 중 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
