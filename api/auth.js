// api/auth.js — 비밀번호 검증 엔드포인트
// 클라이언트가 POST /api/auth { password } 로 요청하면
// 서버에 저장된 DEV_PASSWORD와 비교하고 맞으면 토큰(= 비밀번호 자체)을 반환합니다.
// Notion 토큰은 절대 클라이언트에 노출되지 않습니다.

export default function handler(req, res) {
  // CORS 허용 (같은 도메인이지만 명시)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ ok: false, error: '비밀번호를 입력해주세요.' });
  }

  if (password === process.env.DEV_PASSWORD) {
    // 비밀번호 자체를 Bearer 토큰으로 사용 (개인 도구이므로 충분한 보안)
    return res.status(200).json({ ok: true, token: password });
  }

  return res.status(401).json({ ok: false, error: '비밀번호가 틀렸어요 🙅' });
}
