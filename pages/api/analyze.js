export default async function handler(req, res) {
  // POST만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  const { jdText } = req.body;

  if (!jdText || !jdText.trim()) {
    return res.status(400).json({
      error: { message: "채용공고 텍스트가 비어 있습니다." }
    });
  }

  // API 키 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
    return res.status(500).json({
      error: { message: "GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일에 API 키를 추가해주세요." }
    });
  }

  try {
    // Gemini API는 헤더로 API 키를 전달하는 것을 권장합니다
    // 무료 버전에서는 gemini-1.5-flash 사용 가능 (최신 모델)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
다음 채용공고를 분석해서 JSON 형식으로 정리해줘.

채용공고:
${jdText}

아래 형식의 JSON으로만 응답해줘.
코드블록(\`\`\`)이나 설명 문장은 절대 포함하지 마.

{
  "회사명": "",
  "포지션명": "",
  "회사소개": "",
  "급여": "",
  "회사위치": "",
  "지원자격": "",
  "우대사항": "",
  "주요업무": "",
  "기타": ""
}
                  `.trim()
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API 에러 응답:", {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      return res.status(response.status).json({ 
        error: errorData.error || { message: `API 요청 실패: ${response.status} - ${response.statusText}` }
      });
    }

    const data = await response.json();

    // Gemini API 자체 에러
    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    // 정상 응답
    return res.status(200).json(data);

  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({
      error: { message: "Gemini API 호출 중 오류 발생: " + err.message }
    });
  }
}
