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
}

// Demo Script §6 — 4 fixed turns, keyword-matched in order
const SCRIPT: ScriptStep[] = [
  {
    // After initial open-ended question — student says anything about using the formula
    aiMessage:
      'ดีมาก หนูจำสูตรได้แล้ว 👍 แล้วในสูตรนี้ ด้าน c คือด้านไหนของสามเหลี่ยมมุมฉาก?',
    nextState: 'DIAGNOSTIC_PROBE',
  },
  {
    // Student says "c คือด้านที่ยาวที่สุด" — close but not precise enough
    aiMessage:
      'ใกล้เคียงแล้ว แต่ขอให้จำให้แม่นกว่านั้นนะ — ด้าน c คือด้านที่อยู่ตรงข้ามมุมฉากเสมอ ' +
      'ในสามเหลี่ยมมุมฉากด้านนี้มักยาวที่สุด แต่เวลาทำโจทย์ให้เริ่มจากหามุมฉากก่อน แล้วดูด้านตรงข้าม ' +
      '· ลองอธิบายกลับหน่อยว่าเราจะหาด้าน c จากรูปได้อย่างไร?',
    nextState: 'EXPLAIN_BACK',
  },
  {
    // Student explains back correctly about right angle
    aiMessage:
      'ถูกต้องมาก 🎉 ทีนี้ลองใช้กับโจทย์ใหม่ — สามเหลี่ยมมุมฉากมีด้านประกอบมุมฉากยาว 6 และ 8 หน่วย ' +
      'ด้านตรงข้ามมุมฉากยาวเท่าไร?',
    nextState: 'TRANSFER_CHECK',
  },
  {
    // Student solves 6-8-10
    aiMessage:
      'ถูกต้อง ✅ หนูใช้สูตรได้ถูกและรู้ว่าด้าน c คือด้านตรงข้ามมุมฉาก ' +
      '· เดี๋ยวครูจะเห็นสรุปว่าตอนแรกหนูจำสูตรได้แต่ยังต้องทบทวนการระบุด้าน c และตอนท้ายแก้โจทย์ใหม่ได้แล้ว',
    nextState: 'EVIDENCE_SUMMARY',
  },
];

const FALLBACK =
  'ลองเล่าให้ครูฟังใหม่นะว่า หนูเข้าใจเรื่องด้าน c ของสามเหลี่ยมมุมฉากว่าอย่างไร?';

// Keywords that signal the student is on-track for each turn
const MATCH_KEYWORDS: string[][] = [
  ['สูตร', 'a²', 'a2', 'พีทาโกรัส', 'b²', 'b2', 'c²', 'c2', 'หา', 'คำนวณ', 'ใช้'],
  ['ยาวที่สุด', 'ด้านยาว', 'ยาวสุด', 'c คือ', 'hypot'],
  ['มุมฉาก', 'ตรงข้าม', 'opposite', 'ด้าน c'],
  ['6', '8', '10', '100', '36', '64', 'c =', 'c='],
];

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
