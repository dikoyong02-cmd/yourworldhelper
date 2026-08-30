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

    if (!hfToken) {
      return res.status(500).json({ error: 'Render 환경변수에 HF_TOKEN이 존재하지 않습니다.' });
    }

    if (!prompt || prompt.trim() === '') {
      prompt = "스토리 설정을 자율적으로 생성해 줘.";
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 500, return_full_text: false }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // HF에서 넘겨주는 실제 에러 메시지를 그대로 클라이언트에 전달
      const errorMsg = data.error || JSON.stringify(data);
      console.error('HF API Error:', errorMsg);
      return res.status(500).json({ error: `[HF 에러] ${errorMsg}` });
    }

    const resultText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    res.json({ result: resultText || "생성된 텍스트가 없습니다." });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: `[서버 예외] ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
