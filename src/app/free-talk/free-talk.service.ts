import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TutorService } from '../tutor.service';
import { StudentProfileService } from '../student-profile/student-profile.service';

export interface FreeTalkMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FreeTalkRequest {
  history: FreeTalkMessage[];
  message: string;
  studentName?: string;
  duringLesson: boolean;
}

interface FreeTalkResponse {
  message: string;
  suggestLesson: boolean;
}

@Injectable({ providedIn: 'root' })
export class FreeTalkService {
  private http    = inject(HttpClient);
  private tutor   = inject(TutorService);
  private profile = inject(StudentProfileService);

  private _messages     = signal<FreeTalkMessage[]>([]);
  private _loading      = signal(false);
  private _suggestLesson = signal(false);

  readonly messages      = this._messages.asReadonly();
  readonly loading       = this._loading.asReadonly();
  readonly suggestLesson = this._suggestLesson.asReadonly();

  start(duringLesson: boolean): void {
    this._messages.set([]);
    this._suggestLesson.set(false);

    const name = this.profile.displayName();
    const n    = name || 'น้อง';

    const welcome = duringLesson
      ? `ไม่เป็นไรเลย พักคุยกันก่อนได้ 😊\n\nโจทย์ข้อนี้ทำให้รู้สึกยังไงบ้าง?\nยาก เบื่อ หรือเหนื่อยจากอย่างอื่น?`
      : `สวัสดี ${n} 😊\n\nพี่ยินดีต้อนรับนะ\nมีอะไรอยากเล่าให้ฟังไหม หรือวันนี้เป็นยังไงบ้าง?`;

    this._messages.set([{ role: 'assistant', content: welcome }]);
  }

  async send(text: string, duringLesson: boolean): Promise<void> {
    if (this._loading() || !text.trim()) return;

    const userMsg: FreeTalkMessage = { role: 'user', content: text.trim() };
    this._messages.update(m => [...m, userMsg]);
    this._loading.set(true);

    try {
      const body: FreeTalkRequest = {
        history: this._messages().slice(0, -1),
        message: text.trim(),
        studentName: this.profile.displayName() || undefined,
        duringLesson,
      };

      const res = await firstValueFrom(
        this.http.post<FreeTalkResponse>('/api/freetalk', body)
      );

      this._messages.update(m => [...m, { role: 'assistant', content: res.message }]);
      if (res.suggestLesson) this._suggestLesson.set(true);
    } catch {
      this._messages.update(m => [
        ...m,
        { role: 'assistant', content: 'ขอโทษนะ พี่ตอบไม่ได้ตอนนี้ ลองใหม่อีกทีได้เลย 😊' },
      ]);
    } finally {
      this._loading.set(false);
    }
  }
}
