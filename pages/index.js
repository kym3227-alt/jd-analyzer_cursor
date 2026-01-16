import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function analyzeJD() {
    if (!jdText.trim()) {
      alert('채용공고를 입력해주세요!');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText })
      });

      // HTTP 상태 코드 확인 추가
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `서버 오류: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "서버 오류");
      }

      // 안전한 데이터 접근 추가 (OpenAI API 형식)
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error("응답 데이터 형식이 올바르지 않습니다. choices가 없습니다.");
      }

      const choice = data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("응답 데이터 형식이 올바르지 않습니다. message.content가 없습니다.");
      }

      const resultText = choice.message.content;
      
      if (!resultText) {
        throw new Error("응답 텍스트가 없습니다.");
      }

      const jsonMatch = resultText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error("응답 텍스트:", resultText); // 디버깅용
        throw new Error("JSON 형식을 찾을 수 없습니다.");
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        setResults(parsed);
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError);
        console.error("파싱 시도한 텍스트:", jsonMatch[0]);
        throw new Error("JSON 파싱 중 오류가 발생했습니다.");
      }

    } catch (err) {
      setError(err.message);
      console.error("전체 오류:", err);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: '회사명', emoji: '🏢' },
    { key: '포지션명', emoji: '💼' },
    { key: '회사소개', emoji: '📝' },
    { key: '급여', emoji: '💰' },
    { key: '회사위치', emoji: '📍' },
    { key: '지원자격', emoji: '✅' },
    { key: '우대사항', emoji: '⭐' },
    { key: '주요업무', emoji: '📋' },
    { key: '기타', emoji: '💡' }
  ];

  return (
    <>
      <Head>
        <title>🎯 JD 분석기</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="container">
        <h1>🎯 JD 분석기</h1>
        <p className="subtitle">채용공고를 붙여넣으면 AI가 자동으로 분석해드려요!</p>

        <textarea
          id="jdInput"
          placeholder="여기에 채용공고 전체를 복사해서 붙여넣으세요..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        <button id="analyzeBtn" onClick={analyzeJD} disabled={loading}>
          분석하기
        </button>

        {loading && (
          <div className="loading active">
            <div className="spinner"></div>
            <p>🤖 AI가 열심히 분석하고 있어요...</p>
          </div>
        )}

        {error && (
          <div className="result-section active">
            <div style={{ color: 'red', padding: '20px', background: '#fee', borderRadius: '12px' }}>
              오류: {error}
            </div>
          </div>
        )}

        {results && (
          <div className="result-section active">
            <h2>📊 분석 결과</h2>
            <div id="resultContent">
              {fields.map(f => {
                if (results[f.key] && results[f.key].trim()) {
                  return (
                    <div key={f.key} className="field">
                      <h3>{f.emoji} {f.key}</h3>
                      <p>{results[f.key]}</p>
                    </div>
                  );
                }
                return null;
              })}
              {fields.every(f => !results[f.key] || !results[f.key].trim()) && (
                <p className="empty">분석 결과를 찾을 수 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          font-size: 32px;
          margin-bottom: 10px;
          color: #667eea;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 16px;
        }
        textarea {
          width: 100%;
          min-height: 300px;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 40px;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading {
          display: none;
          text-align: center;
          margin-top: 30px;
        }
        .loading.active {
          display: block;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .result-section {
          margin-top: 40px;
          display: none;
        }
        .result-section.active {
          display: block;
        }
        .field {
          margin-bottom: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 5px solid #667eea;
        }
        .field h3 {
          margin-bottom: 10px;
          color: #667eea;
        }
        .empty {
          color: #999;
          font-style: italic;
        }
      `}</style>
    </>
  );
}
