import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TutorService } from '../tutor.service';
import { StudentProfileService } from '../student-profile/student-profile.service';

export interface ProjectBrainMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface EvidenceItem {
  evidenceType: string;
  userStatement: string;
  aiInterpretation: string;
  confidence: number;
}

interface ProjectBrainRequest {
  history: { role: string; text: string }[];
  message: string;
  phase: string;
  studentName?: string;
}

interface ProjectBrainResponse {
  message: string;
  phase: string;
  suggestSummary: boolean;
  evidence?: EvidenceItem[];
}

interface SaveEvidenceRequest {
  studentId?: string;
  topic: string;
  items: EvidenceItem[];
}

export type ProjectBrainPhase = 'teach' | 'reflect' | 'grill' | 'summary';

@Injectable({ providedIn: 'root' })
export class ProjectBrainTutorService {
  private http    = inject(HttpClient);
  private tutor   = inject(TutorService);
  private profile = inject(StudentProfileService);

  private _messages       = signal<ProjectBrainMessage[]>([]);
  private _loading        = signal(false);
  private _phase          = signal<ProjectBrainPhase>('teach');
  private _suggestSummary = signal(false);
  private _evidence       = signal<EvidenceItem[]>([]);

  readonly messages       = this._messages.asReadonly();
  readonly loading        = this._loading.asReadonly();
  readonly phase          = this._phase.asReadonly();
  readonly suggestSummary = this._suggestSummary.asReadonly();
  readonly evidence       = this._evidence.asReadonly();

  start(): void {
    this._messages.set([]);
    this._phase.set('teach');
    this._suggestSummary.set(false);
    this._evidence.set([]);

    this.tutor.addProjectBrainEvent('project_brain_started');
    this._loadTeach();
  }

  private async _loadTeach(): Promise<void> {
    this._loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<ProjectBrainResponse>('/api/project-brain/chat', {
          history: [],
          message: 'เริ่ม',
          phase: 'teach',
          studentName: this.profile.displayName() || undefined,
        })
      );
      this._messages.set([{ role: 'assistant', content: res.message }]);
      this._phase.set(res.phase as ProjectBrainPhase);
    } catch {
      this._messages.set([{ role: 'assistant', content: 'ขอโทษนะคะ เชื่อมต่อไม่ได้ตอนนี้ ลองใหม่อีกทีได้เลย 😊' }]);
    } finally {
      this._loading.set(false);
    }
  }

  async send(text: string): Promise<void> {
    if (this._loading() || !text.trim()) return;

    const userMsg: ProjectBrainMessage = { role: 'user', content: text.trim() };
    this._messages.update(m => [...m, userMsg]);
    this._loading.set(true);

    this.tutor.addProjectBrainEvent('project_brain_message_sent');

    try {
      const history = this._messages()
        .slice(0, -1)
        .map(m => ({ role: m.role, text: m.content }));

      const body: ProjectBrainRequest = {
        history,
        message: text.trim(),
        phase: this._phase(),
        studentName: this.profile.displayName() || undefined,
      };

      const res = await firstValueFrom(
        this.http.post<ProjectBrainResponse>('/api/project-brain/chat', body)
      );

      this._messages.update(m => [...m, { role: 'assistant', content: res.message }]);

      // Accumulate evidence
      if (res.evidence?.length) {
        this._evidence.update(e => [...e, ...res.evidence!]);
      }

      const nextPhase = res.phase as ProjectBrainPhase;
      if (nextPhase !== this._phase()) {
        this._phase.set(nextPhase);
        this.tutor.addProjectBrainEvent(`project_brain_phase_changed:${nextPhase}`);
      }

      if (res.suggestSummary) this._suggestSummary.set(true);

      if (nextPhase === 'summary') {
        this.tutor.addProjectBrainEvent('project_brain_summary_shown');
      }
    } catch {
      this._messages.update(m => [
        ...m,
        { role: 'assistant', content: 'ขอโทษนะคะ ตอบไม่ได้ตอนนี้ ลองใหม่อีกทีได้เลย 😊' },
      ]);
    } finally {
      this._loading.set(false);
    }
  }

  async requestSummary(): Promise<void> {
    await this.send('ขอสรุป');
  }

  saveEvidence(sessionId: string): void {
    const items = this._evidence();
    if (!items.length || !sessionId) return;

    const body: SaveEvidenceRequest = {
      studentId: this.profile.studentId() || undefined,
      topic: 'understanding_engine',
      items,
    };

    // Fire-and-forget
    this.http.post(`/api/project-brain/sessions/${sessionId}/evidence`, body)
      .subscribe({ error: () => {} });

    this.tutor.addProjectBrainEvent(`project_brain_evidence_saved:${items.length}`);
  }
}
