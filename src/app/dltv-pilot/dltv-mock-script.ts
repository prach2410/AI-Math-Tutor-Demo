export type LearningState =
  | 'RECALL_CHECK'
  | 'DIAGNOSTIC_PROBE'
  | 'SCAFFOLDING'
  | 'EXPLAIN_BACK'
  | 'TRANSFER_CHECK'
  | 'EVIDENCE_SUMMARY';

export interface ScriptStep {
  aiMessage: string;
  nextState: LearningState;
  imageUrl?: string;
  suggestedReply?: string;
}

// Demo Script §6 — 4 fixed turns, keyword-matched in order (grounded DLTV ค22101)
const SCRIPT: ScriptStep[] = [
  {
    aiMessage:
      'ที่ใช้พีทาโกรัสกับสี่เหลี่ยมนี้ได้เพราะอะไร แล้ว AC (= 50) คือด้านไหนของสามเหลี่ยม?',
    nextState: 'DIAGNOSTIC_PROBE',
    imageUrl: '/dltv-pilot/rect-abcd.jpg',
    suggestedReply: 'ใช้สูตร a²+b²=c² ได้ AC = 50',
  },
  {
    aiMessage:
      'ใกล้แล้ว — แต่ที่ถูกคือ เส้นทแยง AC ตัดสี่เหลี่ยม ABCD ให้เกิดสามเหลี่ยมมุมฉาก ABC ' +
      '(มุมฉากที่ B) · AC จึงเป็นด้านตรงข้ามมุมฉากของสามเหลี่ยมนั้น ไม่ใช่แค่ "ด้านที่ยาวที่สุด" ' +
      '· ลองอธิบายกลับให้ครูฟังหน่อยว่า ทำไมเราถึงรู้ว่า AC คือด้านตรงข้ามมุมฉาก?',
    nextState: 'EXPLAIN_BACK',
    suggestedReply: 'AC คือด้านที่ยาวที่สุด',
  },
  {
    aiMessage:
      'ถูกต้อง 🎉 ทีนี้ลองโจทย์จริงจากแบบฝึกหัด 3 ข้อ 2 — ' +
      'ว่าว MABN มี MA=MB=6, AN=BN=8 และมุมฉากที่ B · หา MN ยาวเท่าไร?',
    nextState: 'TRANSFER_CHECK',
    imageUrl: '/dltv-pilot/worksheet3-q2.jpg',
    suggestedReply: 'ต้องหามุมฉากก่อน แล้วด้านตรงข้ามมุมฉากคือด้านนั้น',
  },
  {
    aiMessage:
      'ถูกต้อง ✅ หนูใช้สามเหลี่ยมมุมฉาก MBN (มุมฉากที่ B) ได้ถูก — MN = 10 ' +
      '· ตอนนี้หนูพร้อมทำโจทย์แบ่งรูป (ข้อ 1, 3) แล้ว ' +
      '· เดี๋ยวครูจะเห็นสรุปผลการเรียนรู้ของหนูวันนี้',
    nextState: 'EVIDENCE_SUMMARY',
    suggestedReply: '6²+8²=100 ดังนั้น MN=10',
  },
];

const FALLBACK =
  'ลองเล่าให้ครูฟังใหม่นะ — เราจะรู้ได้อย่างไรว่าด้านไหนคือด้านตรงข้ามมุมฉาก?';

// Keywords that signal the student is on-track for each turn
const MATCH_KEYWORDS: string[][] = [
  ['สูตร', 'a²', 'a2', 'พีทาโกรัส', 'b²', 'b2', 'c²', 'c2', '50', 'ac', 'ทแยง', 'หา', 'คำนวณ', 'ใช้'],
  ['ยาวที่สุด', 'ด้านยาว', 'ยาวสุด', 'ac คือ', 'hypot'],
  ['มุมฉาก', 'ตรงข้าม', 'opposite', 'ด้าน'],
  ['6', '8', '10', '100', '36', '64', 'mn', 'mn=', 'mn ='],
];

export function getSuggestedReply(turn: number): string | undefined {
  return SCRIPT[turn]?.suggestedReply;
}

export function getScriptResponse(
  userMessage: string,
  turn: number
): { step: ScriptStep; matched: boolean } {
  if (turn >= SCRIPT.length) {
    return { step: { aiMessage: FALLBACK, nextState: 'EVIDENCE_SUMMARY' }, matched: false };
  }
  const lower = userMessage.toLowerCase();
  const keywords = MATCH_KEYWORDS[turn] ?? [];
  const matched = keywords.some((kw) => lower.includes(kw.toLowerCase()));
  if (matched) {
    return { step: SCRIPT[turn], matched: true };
  }
  return {
    step: { aiMessage: FALLBACK, nextState: SCRIPT[turn].nextState },
    matched: false,
  };
}

export const STATE_LABELS: Record<LearningState, { emoji: string; label: string; color: string }> =
  {
    RECALL_CHECK: { emoji: '🔵', label: 'กำลังทบทวน', color: '#3b82f6' },
    DIAGNOSTIC_PROBE: { emoji: '🟡', label: 'กำลังค้นหาจุดที่ติด', color: '#eab308' },
    SCAFFOLDING: { emoji: '🟠', label: 'กำลังช่วยเฉพาะจุด', color: '#f97316' },
    EXPLAIN_BACK: { emoji: '🟢', label: 'กำลังให้เด็กอธิบายกลับ', color: '#22c55e' },
    TRANSFER_CHECK: { emoji: '🔵', label: 'กำลังตรวจความเข้าใจอีกครั้ง', color: '#3b82f6' },
    EVIDENCE_SUMMARY: { emoji: '✅', label: 'สรุปผลให้ครู', color: '#16a34a' },
  };
