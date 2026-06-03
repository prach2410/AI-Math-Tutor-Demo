import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AssistResponse, AssistType,
  EvaluateRequest, EvaluateResponse, StartResponse,
  SessionMessage, SessionEvent, CreateSessionRequest,
  CompleteSessionRequest, ParentFeedbackRequest
} from './models/learning.model';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isHint?: boolean;
  isGuided?: boolean;
  isWorkedExample?: boolean;
  isReflection?: boolean;
}

export interface ScenarioMeta {
  id: string;
  icon: string;
  title: string;
}

export const SCENARIOS: ScenarioMeta[] = [
  { id: 'fish-tank',  icon: '🐠', title: 'ตู้ปลา' },
  { id: 'parcel',     icon: '📦', title: 'กล่องพัสดุ' },
  { id: 'water-tank', icon: '💧', title: 'ถังน้ำ' },
];

const API = '/api/learning';
const SESSION_API = '/api/learning-sessions';

const TRIGGER_WORDS = ['ไม่รู้', 'งง', 'ไม่เข้าใจ', 'ขอเฉลย', 'ไม่ทราบ', 'ช่วยด้วย'];

@Injectable({ providedIn: 'root' })
export class TutorService {
  private http = inject(HttpClient);

  private _scenario      = signal<ScenarioMeta>(SCENARIOS[0]);
  private _messages      = signal<Message[]>([]);
  private _studentNote   = signal('');
  private _parentSummary = signal('');
  private _loading       = signal(false);
  private _currentStep   = signal(0);
  private _totalSteps    = signal(0);
  private _finished      = signal(false);
  private _realWorldUses    = signal<string[]>([]);
  private _reflection       = signal<string[]>([]);
  private _studentFeedback  = signal('');
  private _parentCoaching   = signal('');
  private _wrongCount       = 0;
  private _hintCount        = 0;
  private _guidedCount      = 0;
  private _exampleCount     = 0;

  // Session tracking
  private _sessionId            = signal('');
  private _sessionStartedAt     = signal<Date | null>(null);
  private _sessionEvents: SessionEvent[] = [];
  private _sessionMessages: SessionMessage[] = [];
  private _parentFeedbackSubmitted = signal(false);

  readonly scenario      = this._scenario.asReadonly();
  readonly messages      = this._messages.asReadonly();
  readonly studentNote   = this._studentNote.asReadonly();
  readonly parentSummary = this._parentSummary.asReadonly();
  readonly loading       = this._loading.asReadonly();
  readonly currentStep   = this._currentStep.asReadonly();
  readonly totalSteps    = this._totalSteps.asReadonly();
  readonly finished      = this._finished.asReadonly();
  readonly realWorldUses   = this._realWorldUses.asReadonly();
  readonly reflection      = this._reflection.asReadonly();
  readonly studentFeedback = this._studentFeedback.asReadonly();
  readonly parentCoaching  = this._parentCoaching.asReadonly();
  readonly scenarios       = SCENARIOS;
  readonly sessionId       = this._sessionId.asReadonly();
  readonly parentFeedbackSubmitted = this._parentFeedbackSubmitted.asReadonly();

  async selectScenario(id: string): Promise<void> {
    const meta = SCENARIOS.find(s => s.id === id);
    if (!meta) return;

    this._scenario.set(meta);
    this._messages.set([]);
    this._studentNote.set('');
    this._parentSummary.set('');
    this._finished.set(false);
    this._realWorldUses.set([]);
    this._reflection.set([]);
    this._studentFeedback.set('');
    this._parentCoaching.set('');
    this._wrongCount   = 0;
    this._hintCount    = 0;
    this._guidedCount  = 0;
    this._exampleCount = 0;
    this._loading.set(true);

    // Reset session state
    const newSessionId = crypto.randomUUID();
    const now = new Date();
    this._sessionId.set(newSessionId);
    this._sessionStartedAt.set(now);
    this._sessionEvents = [];
    this._sessionMessages = [];
    this._parentFeedbackSubmitted.set(false);
    this.addEvent('lesson_started');

    // Create session on server (fire-and-forget, don't block lesson)
    this.createSession(newSessionId, meta.title, now).catch(() => {});

    try {
      const res = await firstValueFrom(
        this.http.get<StartResponse>(`${API}/start/${id}`)
      );
      this._currentStep.set(res.stepNumber);
      this._totalSteps.set(res.totalSteps);
      this._realWorldUses.set(res.realWorldUses);
      const q: Message = { role: 'assistant', content: res.question };
      this._messages.set([q]);
      this.addSessionMessage(q);
    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: 'ไม่สามารถเชื่อมต่อ server ได้ครับ กรุณาตรวจสอบ backend',
      };
      this._messages.set([errMsg]);
      this.addSessionMessage(errMsg, 'error');
    } finally {
      this._loading.set(false);
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (this._finished()) return;

    const userMsg: Message = { role: 'user', content: text };
    this._messages.update(msgs => [...msgs, userMsg]);
    this.addSessionMessage(userMsg);
    this.addEvent('student_answer_submitted');
    this._loading.set(true);

    const body: EvaluateRequest = {
      scenarioId: this._scenario().id,
      stepNumber: this._currentStep(),
      answer: text,
      wrongCount: this._wrongCount,
      hintCount: this._hintCount,
      guidedCount: this._guidedCount,
    };

    try {
      const res = await firstValueFrom(
        this.http.post<EvaluateResponse>(`${API}/evaluate`, body)
      );
      this.addEvent('answer_evaluated');
      this.applyResponse(res);
    } catch {
      const errMsg: Message = { role: 'assistant', content: 'ไม่สามารถเชื่อมต่อ server ได้ครับ' };
      this._messages.update(msgs => [...msgs, errMsg]);
      this.addSessionMessage(errMsg, 'error');
    } finally {
      this._loading.set(false);
    }
  }

  async requestAssist(type: AssistType): Promise<void> {
    if (this._finished() || this._loading()) return;
    this._loading.set(true);

    const eventMap: Record<AssistType, string> = {
      'hint': 'hint_clicked',
      'guided': 'help_me_start_clicked',
      'worked-example': 'example_clicked',
    };
    this.addEvent(eventMap[type]);

    try {
      const res = await firstValueFrom(
        this.http.get<AssistResponse>(
          `${API}/assist/${this._scenario().id}/${this._currentStep()}/${type}`
        )
      );
      const flags = {
        isHint: type === 'hint',
        isGuided: type === 'guided',
        isWorkedExample: type === 'worked-example',
      };
      const assistMsg: Message = { role: 'assistant', content: res.message, ...flags };
      this._messages.update(msgs => [...msgs, assistMsg]);
      const msgType = type === 'hint' ? 'hint' : type === 'guided' ? 'guided' : 'worked_example';
      this.addSessionMessage(assistMsg, msgType);
      if (type === 'hint')           this._hintCount++;
      if (type === 'guided')       { this._guidedCount++; this._wrongCount = 0; }
      if (type === 'worked-example') this._exampleCount++;
    } catch {
      const errMsg: Message = { role: 'assistant', content: 'ไม่สามารถโหลดข้อมูลได้ครับ' };
      this._messages.update(msgs => [...msgs, errMsg]);
      this.addSessionMessage(errMsg, 'error');
    } finally {
      this._loading.set(false);
    }
  }

  logEvent(type: string): void {
    this.addEvent(type);
  }

  async submitParentFeedback(req: ParentFeedbackRequest): Promise<void> {
    if (this._parentFeedbackSubmitted()) return;
    this.addEvent('parent_feedback_submitted');
    this._parentFeedbackSubmitted.set(true);

    const sessionId = this._sessionId();
    if (!sessionId) return;

    try {
      await firstValueFrom(
        this.http.post(`${SESSION_API}/${sessionId}/parent-feedback`, req)
      );
    } catch {
      // silent fail — feedback data may be in event log
    }
  }

  private applyResponse(res: EvaluateResponse): void {
    if (res.isGuidedAssistance) {
      this._wrongCount = 0;
      const msg: Message = { role: 'assistant', content: res.message, isGuided: true };
      this._messages.update(msgs => [...msgs, msg]);
      this.addSessionMessage(msg, 'guided');
      return;
    }

    const msg: Message = { role: 'assistant', content: res.message };
    this._messages.update(msgs => [...msgs, msg]);
    this.addSessionMessage(msg);

    if (!res.correct) {
      this._wrongCount++;
      if (res.hint) {
        const hintMsg: Message = { role: 'assistant', content: `💡 ${res.hint}`, isHint: true };
        this._messages.update(msgs => [...msgs, hintMsg]);
        this.addSessionMessage(hintMsg, 'hint');
      }
      return;
    }

    this._wrongCount = 0;

    if (res.nextStep) {
      this._currentStep.set(res.nextStep.stepNumber);
      const nextMsg: Message = { role: 'assistant', content: res.nextStep.question };
      this._messages.update(msgs => [...msgs, nextMsg]);
      this.addSessionMessage(nextMsg);
    }

    if (res.studentNote)        this._studentNote.set(res.studentNote);
    if (res.parentSummary)      this._parentSummary.set(res.parentSummary);
    if (res.learningReflection) this._reflection.set(res.learningReflection);
    if (res.studentFeedback)    this._studentFeedback.set(res.studentFeedback);
    if (res.parentCoachingTips) this._parentCoaching.set(res.parentCoachingTips);

    if (!res.nextStep) {
      this._finished.set(true);
      this.addEvent('lesson_completed');
      this.completeSession().catch(() => {});
    }
  }

  init(): void {
    this.selectScenario(SCENARIOS[0].id);
  }

  private addEvent(type: string): void {
    this._sessionEvents.push({ type, timestamp: new Date().toISOString() });
  }

  private addSessionMessage(
    msg: Message,
    typeOverride?: 'answer' | 'message' | 'hint' | 'guided' | 'worked_example' | 'error'
  ): void {
    const role: SessionMessage['role'] = msg.role === 'user' ? 'student' : 'ai';
    let type: SessionMessage['type'];
    if (typeOverride) {
      type = typeOverride;
    } else if (msg.isHint) {
      type = 'hint';
    } else if (msg.isGuided) {
      type = 'guided';
    } else if (msg.isWorkedExample) {
      type = 'worked_example';
    } else if (msg.role === 'user') {
      type = 'answer';
    } else {
      type = 'message';
    }
    this._sessionMessages.push({ role, type, text: msg.content, timestamp: new Date().toISOString() });
  }

  private async createSession(sessionId: string, topic: string, startedAt: Date): Promise<void> {
    const req: CreateSessionRequest = {
      sessionId,
      topic,
      studentAlias: 'Student-001',
      startedAt: startedAt.toISOString(),
    };
    await firstValueFrom(this.http.post(SESSION_API, req));
  }

  private async completeSession(): Promise<void> {
    const sessionId = this._sessionId();
    const startedAt = this._sessionStartedAt();
    if (!sessionId || !startedAt) return;

    const now = new Date();
    const durationSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000);

    const req: CompleteSessionRequest = {
      completedAt: now.toISOString(),
      messages: [...this._sessionMessages],
      events: [...this._sessionEvents],
      summary: {
        hintUsed: this._hintCount,
        helpMeStartUsed: this._guidedCount,
        exampleUsed: this._exampleCount,
        completed: true,
        durationSeconds,
      },
    };

    await firstValueFrom(
      this.http.post(`${SESSION_API}/${sessionId}/complete`, req)
    );
  }
}
