const express = require("express");
const path = require("path");
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    // 1. Render에 설정된 GEMINI_API_KEY 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY가 Render 환경변수에 설정되지 않았습니다." });
    }

    const { system, messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages 배열이 전달되지 않았습니다." });
    }

    // 2. 메시지 변환 (Gemini 규격: role은 'user' 또는 'model')
    const contents = messages
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content) }]
      }));

    // 3. 정확한 공식 Gemini 모델명 및 REST API URL 구성
    // 공식 모델명: gemini-1.5-flash 또는 gemini-2.5-flash
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: contents
    };

    // 시스템 프롬프트(세계관 설정 등) 처리
    if (system && String(system).trim().length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: String(system) }]
      };
    }

    // 4. Gemini API 호출
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await r.json();

    // API에서 400, 404, 403 등의 에러가 반환된 경우
    if (!r.ok) {
      console.error("Gemini API Error Status:", r.status);
      console.error("Gemini API Error Detail:", JSON.stringify(data));
      return res.status(r.status).json(data);
    }

    // 5. 응답 텍스트 추출
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성하지 못했습니다.";

    // 프론트엔드 호환성Response 반환
    res.json({
      text: replyText,
      reply: replyText,
      content: [{ type: "text", text: replyText }],
      choices: [{ message: { content: replyText } }]
    });

  } catch (e) {
    console.error("Server Internal Error:", e);
    res.status(502).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server is running..."));
