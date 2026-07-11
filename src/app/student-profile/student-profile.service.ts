import { Injectable, signal } from '@angular/core';

const STUDENT_ID_KEY   = 'ai_tutor_student_id';
const DISPLAY_NAME_KEY = 'ai_tutor_display_name';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private _studentId   = signal(this.loadOrCreateStudentId());
  private _displayName = signal(localStorage.getItem(DISPLAY_NAME_KEY) ?? '');

  readonly studentId   = this._studentId.asReadonly();
  readonly displayName = this._displayName.asReadonly();

  setDisplayName(name: string): void {
    const trimmed = name.trim();
    if (!/\p{L}/u.test(trimmed)) return; // no real letter (e.g. lone combining mark) — keep existing value
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
