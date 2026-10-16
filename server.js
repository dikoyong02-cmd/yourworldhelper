const express = require("express");
const path = require("path");
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// 기본 모델 (Gemini 1.5 계열은 종료되어 404가 납니다)
const DEFAULT_MODEL = "gemini-2.5-flash";

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY가 Render 환경변수에 설정되지 않았습니다." });
    }

    const { system, messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages 배열이 전달되지 않았습니다." });
    }

    // 메시지 변환 (role: user / model)
    let contents = messages
      .filter((m) => m && m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content) }]
      }));

    // Gemini는 첫 메시지가 user여야 함 (앞쪽 model 메시지 제거)
    while (contents.length && contents[0].role !== "user") contents.shift();

    // 같은 role이 연속되면 하나로 합침 (오류 응답 등으로 꼬이는 것 방지)
    const merged = [];
    for (const c of contents) {
      const last = merged[merged.length - 1];
      if (last && last.role === c.role) {
        last.parts[0].text += "\n\n" + c.parts[0].text;
      } else {
        merged.push({ role: c.role, parts: [{ text: c.parts[0].text }] });
      }
    }
    contents = merged;

    if (contents.length === 0) {
      return res.status(400).json({ error: "보낼 메시지가 없습니다." });
    }

    // Render 환경변수 GEMINI_MODEL에 옛 모델명이 남아 있으면 무시하고 기본값 사용
    let modelName = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
    if (/^gemini-1\.5/.test(modelName)) modelName = DEFAULT_MODEL;
    modelName = modelName.replace(/^models\//, "");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    const requestBody = { contents };

    if (system && String(system).trim().length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: String(system) }]
      };
    }

    // API 키는 URL이 아닌 헤더로 전달
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(requestBody)
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("Gemini API Error Status:", r.status, "model:", modelName);
      console.error("Gemini API Error Detail:", JSON.stringify(data));
      const msg = data?.error?.message || "Gemini API 오류";
      return res.status(r.status).json({ error: msg, detail: data });
    }

    // 모든 parts의 텍스트를 이어붙임 (2.5 모델은 parts가 여러 개일 수 있음)
    const parts = data.candidates?.[0]?.content?.parts || [];
    const replyText =
      parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("") ||
      (data.promptFeedback?.blockReason
        ? `요청이 차단되었습니다: ${data.promptFeedback.blockReason}`
        : "답변을 생성하지 못했습니다.");

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
