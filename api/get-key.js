// api/get-key.js
export default function handler(req, res) {
  // Vercel 환경 변수에서 API 키를 가져옵니다.
  // 이 변수는 Vercel 대시보드에서 설정해야 합니다.
  const apiKey = process.env.KAKAO_MAPS_API_KEY;

  if (!apiKey) {
    // 환경 변수가 설정되지 않았을 경우 500 오류를 반환합니다.
    return res.status(500).json({ error: 'API key not configured.' });
  }

  // API 키를 JSON 형태로 클라이언트에게 반환합니다.
  res.status(200).json({ apiKey: apiKey });
}
