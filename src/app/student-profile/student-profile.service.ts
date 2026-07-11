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

    if (isJunkName(raw)) {
      // D2 (one-shot heal — Task 30 Part D) — ลบ block นี้ commit ถัดไปหลัง verify
      this.setDisplayName('คนเก่ง');
      return;
    }

    // D1 (permanent guard) — junk ที่ D2 ไม่จับ (เช่นหลังลบ D2 แล้ว) ให้ gate เด้งใหม่ ไม่เดาชื่อ
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

  private loadOrCreateStudentId(): string {
    const existing = localStorage.getItem(STUDENT_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STUDENT_ID_KEY, id);
    return id;
  }
}
