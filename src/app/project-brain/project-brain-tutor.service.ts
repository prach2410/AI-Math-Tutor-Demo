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
  priorEvidenceSummary?: string;
  topicId?: string;
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

interface PriorEvidenceEntity {
  summaryJson: string;
}

export type ProjectBrainPhase = 'teach' | 'retrieval' | 'guided' | 'ready' | 'check' | 'reflect' | 'grill' | 'summary';

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
  private _pbSessionId    = signal('');
  private _topicId        = signal<string>('');

  readonly messages       = this._messages.asReadonly();
  readonly loading        = this._loading.asReadonly();
  readonly phase          = this._phase.asReadonly();
  readonly suggestSummary = this._suggestSummary.asReadonly();
  readonly evidence       = this._evidence.asReadonly();
  readonly pbSessionId    = this._pbSessionId.asReadonly();
  readonly topicId        = this._topicId.asReadonly();

  start(topicId: string): void {
    this._messages.set([]);
    this._phase.set('teach');
    this._suggestSummary.set(false);
    this._evidence.set([]);
    this._pbSessionId.set(crypto.randomUUID());
    this._topicId.set(topicId);

    this.tutor.addProjectBrainEvent(`project_brain_started:${topicId}`);
    this._loadOpening();
  }

  private async _loadOpening(): Promise<void> {
    this._loading.set(true);
    try {
      const studentId = this.profile.studentId();
      let priorSummary: string | null = null;

      // Check for prior evidence
      try {
        const prior = await firstValueFrom(
          this.http.get<PriorEvidenceEntity[]>(
            `/api/project-brain/evidence?studentId=${encodeURIComponent(studentId)}&limit=3`
          )
        );
        priorSummary = this._formatPriorSummary(prior);
      } catch { /* no prior evidence or network error — proceed as new session */ }

      const isReturning = !!priorSummary;
      const phase = isReturning ? 'retrieval' : 'teach';

      if (isReturning) {
        this.tutor.addProjectBrainEvent('project_brain_returning_user');
      }

      const res = await firstValueFrom(
        this.http.post<ProjectBrainResponse>('/api/project-brain/chat', {
          history: [],
          message: 'เริ่ม',
          phase,
          studentName: this.profile.displayName() || undefined,
          priorEvidenceSummary: priorSummary ?? undefined,
          topicId: this._topicId(),
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

  private _formatPriorSummary(entities: PriorEvidenceEntity[]): string | null {
    if (!entities?.length) return null;
    const lines: string[] = [];
    for (const entity of entities) {
      try {
        const summary = JSON.parse(entity.summaryJson) as {
          strongEvidence?: string[];
          openQuestions?: string[];
        };
        if (summary.strongEvidence?.length) {
          lines.push('✓ Strong:');
          summary.strongEvidence.slice(0, 3).forEach(e => lines.push(`  • ${e}`));
        }
        if (summary.openQuestions?.length) {
          lines.push('? Questions:');
          summary.openQuestions.slice(0, 2).forEach(q => lines.push(`  • ${q}`));
        }
      } catch { /* skip */ }
    }
    return lines.length ? lines.join('\n') : null;
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
        topicId: this._topicId(),
      };

      const res = await firstValueFrom(
        this.http.post<ProjectBrainResponse>('/api/project-brain/chat', body)
      );

      this._messages.update(m => [...m, { role: 'assistant', content: res.message }]);

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

  saveEvidence(): void {
    const items    = this._evidence();
    const sessionId = this._pbSessionId();
    if (!items.length || !sessionId) return;

    const body: SaveEvidenceRequest = {
      studentId: this.profile.studentId() || undefined,
      topic: this._topicId() || 'understanding_engine',
      items,
    };

    this.http.post(`/api/project-brain/sessions/${sessionId}/evidence`, body)
      .subscribe({ error: () => {} });

    this.tutor.addProjectBrainEvent(`project_brain_evidence_saved:${items.length}`);
  }
}
