const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
// Render 등의 클라우드 환경에서는 process.env.PORT를 사용해야 합니다.
const PORT = process.env.PORT || 3000;

// 1. 미들웨어 설정
app.use(cors()); // CORS 허용 (프론트엔드 통신 오류 방지)
app.use(express.json({ limit: '10mb' })); // 큰 크기의 프롬프트/데이터 수신 허용
app.use(express.urlencoded({ extended: true }));

// 2. 정적 파일 제공 (public 폴더 내의 index.html, CSS, JS 등을 읽어옴)
app.use(express.static(path.join(__dirname, 'public')));

// 3. AI 생성 API 엔드포인트
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    // 프롬프트 입력값 검증
    if (!prompt) {
      return res.status(400).json({ error: '프롬프트 내용이 필요합니다.' });
    }

    /* [실제 AI API 연동 위치]
      Gemini API 또는 OpenAI API를 연동할 때 API Key는 process.env.GEMINI_API_KEY 로 불러옵니다.
    */
    
    // 예시 응답 처리 (실제 API 연동 시 이 부분을 fetch/sdk 호출 결과로 교체)
    const resultText = `### AI 분석 및 생성 결과\n\n요청하신 세부 지침을 바탕으로 작성이 완료되었습니다.\n\n---\n${prompt}`;

    // 정상 응답 전달
    return res.json({ result: resultText });

  } catch (error) {
    console.error('API 처리 중 오류 발생:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
});

// 4. 메인 페이지 라우팅 (모든 경로 접근 시 index.html 반환)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
