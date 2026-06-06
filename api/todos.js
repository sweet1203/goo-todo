// api/todos.js — Notion DB CRUD 프록시
// GET    → Notion DB에서 할일 목록 조회
// POST   → 새 할일 생성
// PATCH  → 완료/미완료 토글
// DELETE → 할일 삭제 (아카이브)

const NOTION_VERSION = '2022-06-28';
const NOTION_API = 'https://api.notion.com/v1';
const DB_ID = process.env.NOTION_DB_ID || '36f0fb7d-31de-8037-af78-cf3134d6c0b4';

// 요청 인증: Authorization: Bearer <password> 헤더 검증
function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  return token === process.env.DEV_PASSWORD;
}

// Notion API 공통 헤더
function notionHeaders() {
  return {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

// Notion 페이지 → 앱 투두 객체 변환
function pageToTodo(page) {
  const titleArr = page.properties['할일']?.title || [];
  const doneAt = page.properties['완료일']?.date?.start || null;
  // Notion '완료' 체크박스가 체크돼 있으면 완료일이 없어도 완료로 처리
  const checkbox = page.properties['완료']?.checkbox ?? false;
  return {
    notionId: page.id,
    text: titleArr[0]?.plain_text || '(제목 없음)',
    createdAt: page.properties['작성일']?.date?.start || page.created_time,
    doneAt: doneAt || (checkbox ? page.last_edited_time : null),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  try {
    // ── GET: 할일 목록 조회 ──────────────────────────────────
    if (req.method === 'GET') {
      const r = await fetch(`${NOTION_API}/databases/${DB_ID}/query`, {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({
          sorts: [{ property: '작성일', direction: 'descending' }],
          filter: { property: '할일', title: { is_not_empty: true } },
        }),
      });

      if (!r.ok) {
        const err = await r.json();
        return res.status(r.status).json({ error: err.message || 'Notion 조회 실패' });
      }

      const data = await r.json();
      const todos = data.results.map(pageToTodo);
      return res.status(200).json({ todos });
    }

    // ── POST: 새 할일 생성 ──────────────────────────────────
    if (req.method === 'POST') {
      const { text, createdAt } = req.body || {};
      if (!text) return res.status(400).json({ error: '할일 내용이 없습니다.' });

      const r = await fetch(`${NOTION_API}/pages`, {
        method: 'POST',
        headers: notionHeaders(),
        body: JSON.stringify({
          parent: { database_id: DB_ID },
          properties: {
            '할일': { title: [{ text: { content: text } }] },
            '작성일': { date: { start: createdAt || new Date().toISOString() } },
          },
        }),
      });

      if (!r.ok) {
        const err = await r.json();
        return res.status(r.status).json({ error: err.message || 'Notion 생성 실패' });
      }

      const page = await r.json();
      return res.status(201).json({ notionId: page.id });
    }

    // ── PATCH: 완료일 업데이트 (완료 ↔ 미완료) ──────────────
    if (req.method === 'PATCH') {
      const { notionId, doneAt } = req.body || {};
      if (!notionId) return res.status(400).json({ error: 'notionId가 없습니다.' });

      // '완료' 체크박스 포함해서 먼저 시도, 없으면 완료일만 업데이트
      let r = await fetch(`${NOTION_API}/pages/${notionId}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({
          properties: {
            '완료일': doneAt ? { date: { start: doneAt } } : { date: null },
            '완료': { checkbox: !!doneAt },
          },
        }),
      });

      // '완료' 체크박스 속성이 DB에 없는 경우 완료일만으로 재시도
      if (!r.ok) {
        r = await fetch(`${NOTION_API}/pages/${notionId}`, {
          method: 'PATCH',
          headers: notionHeaders(),
          body: JSON.stringify({
            properties: {
              '완료일': doneAt ? { date: { start: doneAt } } : { date: null },
            },
          }),
        });
      }

      if (!r.ok) {
        const err = await r.json();
        return res.status(r.status).json({ error: err.message || 'Notion 업데이트 실패' });
      }

      return res.status(200).json({ ok: true });
    }

    // ── DELETE: 할일 아카이브(삭제) ─────────────────────────
    if (req.method === 'DELETE') {
      const { notionId } = req.body || {};
      if (!notionId) return res.status(400).json({ error: 'notionId가 없습니다.' });

      const r = await fetch(`${NOTION_API}/pages/${notionId}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({ archived: true }),
      });

      if (!r.ok) {
        const err = await r.json();
        return res.status(r.status).json({ error: err.message || 'Notion 삭제 실패' });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[todos api error]', err);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}
