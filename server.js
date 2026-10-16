const express = require("express");
const path = require("path");
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    // 1. 환경변수 확인 (GEMINI_API_KEY)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const { system, messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages required" });
    }

    // 2. 메시지 데이터 형식 변환 (Gemini 규격: role 'assistant' -> 'model')
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }]
    }));

    // 사용하실 Gemini 모델명 (기본: gemini-2.5-flash)
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // 3. Gemini REST API 엔드포인트 호출
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: String(system) }] } : undefined,
        contents: contents
      })
    });

    const data = await r.json();

    // 4. Gemini의 응답 결과를 클라이언트가 받아볼 수 있게 반환
    if (!r.ok) {
      return res.status(r.status).json(data);
    }

    // Gemini 응답 텍스트 추출
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 프론트엔드가 요구하는 구조에 맞게 전달
    res.json({ text: replyText, raw: data });

  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("running"));
