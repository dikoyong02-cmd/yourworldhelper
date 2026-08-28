const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API 엔드포인트
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
        return res.status(400).json({ error: '프롬프트 내용이 필요합니다.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            throw new Error(`Gemini API 오류: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        res.json({ result: text });
    } catch (error) {
        console.error('서버 오류:', error);
        res.status(500).json({ error: '서버 처리 중 오류가 발생했습니다.' });
    }
});

// 메인 화면 제공 (프론트엔드 HTML/CSS/JS)
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>yourworldhelper - 블로그 에디터 스타일</title>
    <style>
        :root {
            --bg-color: #f8f9fa;
            --card-bg: #ffffff;
            --text-main: #212529;
            --text-sub: #495057;
            --border-color: #e9ecef;
            --input-bg: #f8f9fa;
            --primary-color: #12b886;
            --primary-hover: #0ca678;
            --quote-bg: #f1f3f5;
            --quote-border: #20c997;
            --copy-btn-bg: #e9ecef;
            --copy-btn-text: #495057;
            --memo-bg: #fff9db;
            --memo-border: #fab005;
            --guide-bg: #eebefa15;
            --guide-border: #ae3ec9;
        }

        [data-theme="dark"] {
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --text-main: #eceff1;
            --text-sub: #adb5bd;
            --border-color: #2b2b2b;
            --input-bg: #252525;
            --primary-color: #20c997;
            --primary-hover: #12b886;
            --quote-bg: #252525;
            --quote-border: #20c997;
            --copy-btn-bg: #343a40;
            --copy-btn-text: #dee2e6;
            --memo-bg: #2c2a1e;
            --memo-border: #fcc419;
            --guide-bg: #3a1d40;
            --guide-border: #d0bfff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            transition: background-color 0.2s, color 0.2s;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            padding: 40px 20px;
            min-height: 100vh;
        }

        .blog-container {
            width: 100%;
            max-width: 720px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .site-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--primary-color);
            letter-spacing: -0.5px;
        }

        .theme-toggle {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
        }

        .guide-card {
            background: var(--guide-bg);
            border: 1px dashed var(--guide-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }

        .guide-title {
            font-size: 15px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 8px;
        }

        .guide-text {
            font-size: 13px;
            line-height: 1.6;
            color: var(--text-sub);
        }

        .guide-list {
            margin-top: 10px;
            padding-left: 18px;
            font-size: 13px;
            color: var(--text-sub);
            line-height: 1.6;
        }

        .tab-menu {
            display: flex;
            gap: 12px;
            margin-bottom: 28px;
        }

        .tab-btn {
            padding: 8px 16px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-sub);
            cursor: pointer;
        }

        .tab-btn.active {
            background: var(--primary-color);
            color: #ffffff;
            border-color: var(--primary-color);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .form-card {
            background: var(--card-bg);
            padding: 28px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .form-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
        }

        .form-desc {
            font-size: 13px;
            color: var(--text-sub);
            margin-bottom: 20px;
        }

        .section {
            margin-bottom: 18px;
        }

        label {
            display: block;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 6px;
        }

        input[type="text"], textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--input-bg);
            color: var(--text-main);
            font-size: 14px;
            outline: none;
        }

        input[type="text"]:focus, textarea:focus {
            border-color: var(--primary-color);
        }

        textarea {
            height: 70px;
            resize: vertical;
        }

        .genre-group {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .genre-btn {
            padding: 6px 12px;
            border: 1px solid var(--border-color);
            border-radius: 16px;
            background: var(--input-bg);
            color: var(--text-sub);
            font-size: 12px;
            cursor: pointer;
        }

        .genre-btn.active {
            background: var(--primary-color);
            color: #fff;
            border-color: var(--primary-color);
        }

        .submit-btn {
            width: 100%;
            padding: 12px;
            background: var(--primary-color);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            margin-top: 10px;
        }

        .submit-btn:hover {
            background: var(--primary-hover);
        }

        .article-card {
            background: var(--card-bg);
            padding: 32px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            display: none;
            box-shadow: 0 4px 16px rgba(0,0,0,0.04);
            margin-bottom: 24px;
        }

        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--border-color);
            margin-bottom: 20px;
        }

        .article-meta {
            font-size: 12px;
            font-weight: 700;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-group {
            display: flex;
            gap: 8px;
        }

        .copy-btn, .add-memo-btn {
            background: var(--copy-btn-bg);
            color: var(--copy-btn-text);
            border: none;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
        }

        .add-memo-btn {
            background: #e7f5ff;
            color: #1c7ed6;
        }

        [data-theme="dark"] .add-memo-btn {
            background: #183144;
            color: #4dabf7;
        }

        .article-body {
            font-size: 15px;
            line-height: 1.8;
            color: var(--text-main);
            white-space: pre-line;
        }

        .blog-quote-box {
            background: var(--quote-bg);
            border-left: 4px solid var(--quote-border);
            padding: 16px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }

        .quote-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 8px;
        }

        .quote-line {
            font-style: italic;
            font-size: 15px;
            margin-bottom: 6px;
        }

        .memo-container {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .memo-card {
            background: var(--memo-bg);
            border: 1px solid var(--memo-border);
            border-radius: 8px;
            padding: 16px;
        }

        .memo-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .memo-card-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--memo-border);
        }

        .memo-card textarea {
            width: 100%;
            height: 80px;
            background: transparent;
            border: none;
            outline: none;
            font-size: 14px;
            color: var(--text-main);
            resize: vertical;
        }
    </style>
</head>
<body>

<div class="blog-container">
    <div class="header">
        <div class="site-title">yourworldhelper</div>
        <div class="header-controls">
            <button class="add-memo-btn" onclick="addGlobalMemo()">📝 메모장 만들기</button>
            <button class="theme-toggle" onclick="toggleTheme()" id="themeBtn">🌙</button>
        </div>
    </div>

    <div class="guide-card">
        <div class="guide-title">📖 이용 안내 및 튜토리얼</div>
        <p class="guide-text">
            이 사이트는 개인 작품 구상이나 스토리의 주제를 찾기 어려워하는 작가님들을 위해 제작된 아이디어 도우미입니다.
        </p>
        <ul class="guide-list">
            <li><strong>이용 팁:</strong> 하단의 탭을 통해 <strong>세계관 영감</strong>, <strong>설정 체크리스트</strong>, <strong>소재 스파크</strong> 기능을 자유롭게 이용해 보세요.</li>
            <li><strong>메모장 활용:</strong> 상단의 <code>📝 메모장 만들기</code> 버튼을 눌러 아이디어를 즉시 임시 저장하고 복사할 수 있습니다.</li>
            <li><strong>사용 규칙:</strong> 본 사이트는 AI를 기반으로 제작되었습니다. 생성된 글감을 바탕으로 공개 작품을 만드실 때에는 <strong>AI 활용 사실을 밝혀주시거나, 일부 내용을 수정하여 사용</strong>해 주시기를 권장합니다.</li>
            <li><strong>참고사항:</strong> 개인 프로젝트로 제작되어 추가적인 버그 수정이나 아이디어 제안은 아쉽게도 따로 반영해 드리기 어렵습니다. 모쪼록 즐겁게 사용해 주세요!</li>
        </ul>
    </div>

    <div id="memoContainer" class="memo-container"></div>

    <div class="tab-menu">
        <button class="tab-btn active" onclick="openTab('worldTab', this)">🌐 세계관 영감</button>
        <button class="tab-btn" onclick="openTab('checklistTab', this)">📋 설정 체크리스트</button>
        <button class="tab-btn" onclick="openTab('sparkTab', this)">💡 소재 & 영감 스파크</button>
    </div>

    <div id="worldTab" class="tab-content active">
        <div class="form-card">
            <div class="form-title">세계관 영감 도우미</div>
            <div class="form-desc">상상력을 자극할 수 있는 단어와 상황 힌트를 포스트 형태로 제공합니다.</div>
            <div class="section">
                <label>생각 중인 키워드 / 메모</label>
                <textarea id="world-setting" placeholder="아이디어 메모를 적어주세요..."></textarea>
            </div>
            <div class="section">
                <label>장르 선택</label>
                <div class="genre-group">
                    <button type="button" class="genre-btn" onclick="toggleGenre(this)">액션</button>
                    <button type="button" class="genre-btn" onclick="toggleGenre(this)">일상</button>
                    <button type="button" class="genre-btn" onclick="toggleGenre(this)">다크판타지</button>
                    <button type="button" class="genre-btn" onclick="toggleGenre(this)">로맨스</button>
                    <button type="button" class="genre-btn" onclick="toggleGenre(this)">SF</button>
                </div>
            </div>
            <button type="button" class="submit-btn" onclick="startWorldHelper()">영감 포스트 생성하기</button>
        </div>

        <div class="article-card" id="worldResultCard">
            <div class="article-header">
                <span class="article-meta">IDEAS & INSPIRATION</span>
                <div class="btn-group">
                    <button class="copy-btn" onclick="copyResult('worldOutput', this)">복사하기</button>
                </div>
            </div>
            <div class="article-body" id="worldOutput"></div>
        </div>
    </div>

    <div id="checklistTab" class="tab-content">
        <div class="form-card">
            <div class="form-title">세계관 설정 체크리스트</div>
            <div class="form-desc">비어있는 설정을 채울 수 있도록 질문을 던져드립니다.</div>
            <div class="section">
                <label>1. 핵심 테마 / 배경</label>
                <input type="text" id="chkCore" placeholder="예: 중세 스팀펑크, 디스토피아 등">
            </div>
            <div class="section">
                <label>2. 절대 규칙 / 시스템</label>
                <input type="text" id="chkRule" placeholder="예: 마법 사용 시 대가 지불 등">
            </div>
            <button type="button" class="submit-btn" onclick="generateChecklistSummary()">점검 질문 받기</button>
        </div>

        <div class="article-card" id="checklistResultCard">
            <div class="article-header">
                <span class="article-meta">SETTING CHECKLIST</span>
                <div class="btn-group">
                    <button class="copy-btn" onclick="copyResult('checklistOutput', this)">복사하기</button>
                </div>
            </div>
            <div class="article-body" id="checklistOutput"></div>
        </div>
    </div>

    <div id="sparkTab" class="tab-content">
        <div class="form-card">
            <div class="form-title">소재 & 영감 스파크</div>
            <div class="form-desc">분위기, 장소, 대사 힌트가 담긴 글감을 구성해 드립니다.</div>
            <div class="section">
                <label>1. 분위기 / 키워드</label>
                <input type="text" id="sparkCondition" placeholder="예: 비밀스러운, 긴장감 넘치는 등">
            </div>
            <div class="section">
                <label>2. 장소 / 상황</label>
                <input type="text" id="sparkPlace" placeholder="예: 비 내리는 정류장, 오래된 서점 등">
            </div>
            <button type="button" class="submit-btn" onclick="generateSpark()">영감 스파크 당기기</button>
        </div>

        <div class="article-card" id="sparkResultCard">
            <div class="article-header">
                <span class="article-meta">STORY SPARK POST</span>
                <div class="btn-group">
                    <button class="copy-btn" onclick="copyResult('sparkOutput', this)">복사하기</button>
                </div>
            </div>
            <div class="article-body" id="sparkOutput"></div>
        </div>
    </div>
</div>

<script>
    let memoCount = 0;

    function toggleTheme() {
        const body = document.body;
        const btn = document.getElementById('themeBtn');
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            btn.innerText = '🌙';
        } else {
            body.setAttribute('data-theme', 'dark');
            btn.innerText = '☀️';
        }
    }

    function openTab(tabId, element) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        element.classList.add('active');
    }

    function toggleGenre(btn) {
        btn.classList.toggle('active');
    }

    function addGlobalMemo() {
        memoCount++;
        const container = document.getElementById('memoContainer');
        const memoId = `memoText_${memoCount}`;

        const memoCard = document.createElement('div');
        memoCard.className = 'memo-card';
        memoCard.id = `memoCard_${memoCount}`;

        memoCard.innerHTML = `
            <div class="memo-card-header">
                <span class="memo-card-title">📌 아이디어 메모 #${memoCount}</span>
                <div class="btn-group">
                    <button class="copy-btn" onclick="copyMemo('${memoId}', this)">메모 복사</button>
                    <button class="copy-btn" style="background:#ffc9c9; color:#c92a2a;" onclick="deleteMemo('memoCard_${memoCount}')">삭제</button>
                </div>
            </div>
            <textarea id="${memoId}" placeholder="떠오르는 아이디어를 즉시 기록하세요..."></textarea>
        `;

        container.appendChild(memoCard);
    }

    function deleteMemo(cardId) {
        document.getElementById(cardId).remove();
    }

    function copyResult(elementId, btnElement) {
        const targetElement = document.getElementById(elementId);
        const textToCopy = targetElement.innerText;

        if (!textToCopy || textToCopy.includes("불러오는 중")) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            btnElement.innerText = "복사됨!";
            setTimeout(() => btnElement.innerText = "복사하기", 1500);
        });
    }

    function copyMemo(memoId, btnElement) {
        const memoText = document.getElementById(memoId).value;

        if (!memoText.trim()) {
            alert("복사할 메모 내용이 없습니다.");
            return;
        }

        navigator.clipboard.writeText(memoText).then(() => {
            btnElement.innerText = "복사됨!";
            setTimeout(() => btnElement.innerText = "메모 복사", 1500);
        });
    }

    async function callGemini(promptText) {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptText })
        });

        if (!response.ok) {
            throw new Error("서버 요청 실패");
        }

        const data = await response.json();
        return data.result;
    }

    async function startWorldHelper() {
        const setting = document.getElementById('world-setting').value;
        const genres = Array.from(document.querySelectorAll('.genre-btn.active')).map(b => b.innerText);
        const card = document.getElementById('worldResultCard');
        const output = document.getElementById('worldOutput');

        output.innerText = "영감 포스트를 작성하는 중입니다...";
        card.style.display = "block";

        const promptText = `창작자에게 영감을 줄 단어 3개, 상황 묘사 2문장, 질문 1개를 작성해줘. [장르]: ${genres.join(', ')} / [메모]: ${setting}`;

        try {
            output.innerText = await callGemini(promptText);
        } catch {
            output.innerText = "오류가 발생했습니다.";
        }
    }

    async function generateChecklistSummary() {
        const core = document.getElementById('chkCore').value;
        const rule = document.getElementById('chkRule').value;
        const card = document.getElementById('checklistResultCard');
        const output = document.getElementById('checklistOutput');

        output.innerText = "질문을 생성 중입니다...";
        card.style.display = "block";

        const promptText = `작성된 내용을 바탕으로 질문 2~3개를 던져줘. - 테마: ${core} / 규칙: ${rule}`;

        try {
            output.innerText = await callGemini(promptText);
        } catch {
            output.innerText = "오류가 발생했습니다.";
        }
    }

    async function generateSpark() {
        const condition = document.getElementById('sparkCondition').value;
        const place = document.getElementById('sparkPlace').value;
        const card = document.getElementById('sparkResultCard');
        const output = document.getElementById('sparkOutput');

        output.innerText = "스파크 포스트를 생성하는 중입니다...";
        card.style.display = "block";

        const promptText = `
조건과 장소에 맞춰 단어, 장면, 대사 힌트, 질문을 아래 JSON 양식으로 출력해줘:
{
  "words": ["단어1", "단어2"],
  "scenes": ["장면1", "장면2"],
  "dialogues": ["대사1", "대사2"],
  "question": "질문"
}
[조건]: ${condition} / [장소]: ${place}`;

        try {
            const raw = await callGemini(promptText);
            const clean = raw.replace(/```json|```/g, "").trim();
            const data = JSON.parse(clean);

            let html = `<strong>1. 키워드 연상</strong>\n`;
            data.words.forEach(w => html += `• ${w}\n`);

            html += `\n<strong>2. 장면 연출</strong>\n`;
            data.scenes.forEach(s => html += `• ${s}\n`);

            html += `
<div class="blog-quote-box">
    <div class="quote-title">💬 대사 힌트 (Inspiration Quotes)</div>
    <div class="quote-line">"${data.dialogues[0]}"</div>
    <div class="quote-line">"${data.dialogues[1]}"</div>
</div>`;

            html += `<strong>3. 창작 연출 질문</strong>\n• ${data.question}`;
            output.innerHTML = html;
        } catch {
            output.innerText = "오류가 발생했습니다.";
        }
    }
</script>

</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 정상 작동 중입니다.`);
});
