import { Injectable, signal } from '@angular/core';

const STUDENT_ID_KEY   = 'ai_tutor_student_id';
const DISPLAY_NAME_KEY = 'ai_tutor_display_name';

function isJunkName(name: string): boolean {
  return !/\p{L}/u.test(name.trim());
}

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private _studentId   = signal(this.loadOrCreateStudentId());
  private _displayName = signal(localStorage.getItem(DISPLAY_NAME_KEY) ?? '');

  readonly studentId   = this._studentId.asReadonly();
  readonly displayName = this._displayName.asReadonly();

  constructor() {
    const raw = localStorage.getItem(DISPLAY_NAME_KEY);
    if (raw === null) return;

    // D1 (permanent guard) — stale junk in localStorage clears itself; gate re-prompts instead of guessing a name
    if (isJunkName(raw)) {
      localStorage.removeItem(DISPLAY_NAME_KEY);
      this._displayName.set('');
    }
  }

  setDisplayName(name: string): void {
    const trimmed = name.trim();
    if (isJunkName(trimmed)) return; // no real letter (e.g. lone combining mark) — keep existing value
    this._displayName.set(trimmed);
    localStorage.setItem(DISPLAY_NAME_KEY, trimmed);
  }

  // ล้างชื่อ (สลับคนเรียน) — ข้าม junk guard ของ setDisplayName เพราะ '' คือ intent ที่ตั้งใจ ไม่ใช่ขยะ
  clearDisplayName(): void {
    this._displayName.set('');
    localStorage.removeItem(DISPLAY_NAME_KEY);
  }

  private loadOrCreateStudentId(): string {
    const existing = localStorage.getItem(STUDENT_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STUDENT_ID_KEY, id);
    return id;
  }
}
