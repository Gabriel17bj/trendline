import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; frame-ancestors *; object-src 'none'; base-uri 'self';"
    );
    res.setHeader(
      "content-security-policy",
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; frame-ancestors *; object-src 'none'; base-uri 'self';"
    );
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("x-frame-options", "ALLOWALL");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("referrer-policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Privacy Policy Route
  app.get("/privacy", (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>개인정보처리방침 - 고교 데이터 추세선 분석기</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #334155; line-height: 1.6; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #1e293b; margin-top: 24px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0; }
    a { color: #4f46e5; text-decoration: underline; }
  </style>
</head>
<body>
  <h1>개인정보처리방침</h1>
  <p>고교 데이터 추세선 분석기(Trendline Lab)는 사용자의 개인정보 보호를 최우선으로 하며, 100% 브라우저 로컬 저장 방식을 채택하고 있습니다.</p>
  <div class="box">
    <strong>개발자:</strong> Gabriel Math (Gabriel Byeongje Jeon)<br>
    <strong>문의 이메일:</strong> gabriel@gabrielmath.kr<br>
    <strong>시행일자:</strong> 2026년 7월 30일
  </div>
  <h2>1. 수집하는 개인정보 항목</h2>
  <p>별도의 회원가입 없이 이용 가능하며, 탐구활동 데이터(X, Y 측정값, 주제, 변수명, 수식, 소감)는 사용자의 웹 브라우저 LocalStorage에만 저장됩니다.</p>
  <h2>2. 제3자 제공 및 AI 피드백 API</h2>
  <p>AI 피드백 기능 이용 시 구글 Gemini API로 최소한의 탐구 텍스트가 전달됩니다. 사용자 이름이나 개인식별정보는 포함되지 않습니다.</p>
  <h2>3. 파기 방법</h2>
  <p>사용자가 앱 상단의 '초기화' 버튼을 누르거나 브라우저 캐시/쿠키를 삭제하는 즉시 완전히 파기됩니다.</p>
  <p><a href="/">메인 분석기로 돌아가기</a></p>
</body>
</html>`);
  });

  // Gemini AI Feedback route for high school students
  app.post("/api/ai-feedback", async (req, res) => {
    try {
      const { userApiKey, topic, xName, yName, equationText, rSquared, slopeMeaning, interceptMeaning, conclusion } = req.body;

      // Use user-provided API key if available, otherwise fall back to environment variable
      const apiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API 키가 설정되지 않았습니다. 사용자 API 키를 입력하거나 환경 변수를 확인해 주세요.",
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
[고등학교 수학/과학 탐구활동 AI 멘토 서비스]
학생이 작성한 추세선 회귀분석 결과와 소감을 읽고, 고등학교 교사 관점에서 격려하며 개선점과 탐구 깊이를 더할 수 있는 친절한 피드백을 제공해 주세요.

[탐구 정보]
- 주제: ${topic || '미정'}
- 변수: X = ${xName || 'X'}, Y = ${yName || 'Y'}
- 추세선 수식: ${equationText || 'N/A'}
- 결정계수(R²): ${rSquared !== undefined ? rSquared.toFixed(4) : 'N/A'}

[학생 작성 내용]
1. 기울기의 의미: ${slopeMeaning || '(작성 안 함)'}
2. Y절편의 의미: ${interceptMeaning || '(작성 안 함)'}
3. 탐구 결론 및 소감: ${conclusion || '(작성 안 함)'}

[피드백 작성 가이드라인]
1. 학생의 탐구와 분석 노력을 칭찬해 주세요.
2. 기울기와 Y절편의 해석이 과학적/수학적 맥락에 부합하는지 짚어주세요.
3. 결정계수(R²) 값의 의미(신뢰도, 오차 이유 등)를 어떻게 논리적으로 보완할 수 있는지 단서를 제시해 주세요.
4. 수식, 변수, 기호를 작성할 때에는 단일 달러 기호 대신 반드시 '$$y = ax + b$$', '$$R^2$$', '$$a = ...$$'와 같이 '$$수식$$' 형태의 올바른 LaTeX 문법을 사용해 주세요.
5. 3~4개의 핵심 문단으로 정중하고 명확하게 한국어로 작성해 주세요.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const feedbackText = response.text || "피드백을 생성할 수 없습니다.";
      return res.json({ feedback: feedbackText });
    } catch (err: any) {
      console.error("Gemini Feedback Error:", err);
      return res.status(500).json({
        error: err.message || "AI 피드백 생성 중 오류가 발생했습니다.",
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
