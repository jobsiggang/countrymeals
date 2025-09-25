// pages/api/school-meal.js
export default async function handler(req, res) {
  try {
    // POST 요청 기준, 클라이언트에서 schoolName 전달
    const { schoolName } = req.body;

    if (!schoolName) {
      return res.status(400).json({
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: "학교 이름을 입력해주세요." } }]
        }
      });
    }

    // 구글 시트 웹앱 URL (데이터 JSON 반환)
    const sheetUrl = "https://script.google.com/macros/s/AKfycbxWmo9v3ZntFULZjXCWedoVvI9BcO6qSwee-sJX9q8shwyTmJxjeyEgxakB6MTKA8kHbA/exec";

    const sheetRes = await fetch(sheetUrl);
    const sheetData = await sheetRes.json();

    // 학교명으로 검색
    const school = sheetData.find(row => row['학교명'] === schoolName);

    let text;
    if (school) {
      text = `🏫 ${school['학교명']} 오늘 급식:\n${school['메뉴'] || "정보 없음"}`;
    } else {
      text = `죄송합니다. "${schoolName}" 학교 정보를 찾을 수 없습니다.`;
    }

    // 카카오 챗봇 JSON 응답 형식
    const responseBody = {
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text } }],
        quickReplies: [
          { label: "학교 검색", action: "message", messageText: "학교 이름과 급식" }
        ]
      }
    };

    res.status(200).json(responseBody);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: "서버에서 오류가 발생했습니다 ⚠️" } }]
      }
    });
  }
}
