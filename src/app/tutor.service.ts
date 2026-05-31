import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AssistResponse, AssistType,
  EvaluateRequest, EvaluateResponse, StartResponse
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
    this._wrongCount  = 0;
    this._hintCount   = 0;
    this._guidedCount = 0;
    this._loading.set(true);

    try {
      const res = await firstValueFrom(
        this.http.get<StartResponse>(`${API}/start/${id}`)
      );
      this._currentStep.set(res.stepNumber);
      this._totalSteps.set(res.totalSteps);
      this._realWorldUses.set(res.realWorldUses);
      this._messages.set([{ role: 'assistant', content: res.question }]);
    } catch {
      this._messages.set([{
        role: 'assistant',
        content: 'ไม่สามารถเชื่อมต่อ server ได้ครับ กรุณาตรวจสอบ backend',
      }]);
    } finally {
      this._loading.set(false);
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (this._finished()) return;

    this._messages.update(msgs => [...msgs, { role: 'user', content: text }]);
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
      this.applyResponse(res);
    } catch {
      this._messages.update(msgs => [
        ...msgs,
        { role: 'assistant', content: 'ไม่สามารถเชื่อมต่อ server ได้ครับ' },
      ]);
    } finally {
      this._loading.set(false);
    }
  }

  async requestAssist(type: AssistType): Promise<void> {
    if (this._finished() || this._loading()) return;
    this._loading.set(true);

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
      this._messages.update(msgs => [
        ...msgs,
        { role: 'assistant', content: res.message, ...flags },
      ]);
      if (type === 'hint')           this._hintCount++;
      if (type === 'guided')       { this._guidedCount++; this._wrongCount = 0; }
      if (type === 'worked-example') this._hintCount++;
    } catch {
      this._messages.update(msgs => [
        ...msgs,
        { role: 'assistant', content: 'ไม่สามารถโหลดข้อมูลได้ครับ' },
      ]);
    } finally {
      this._loading.set(false);
    }
  }

  private applyResponse(res: EvaluateResponse): void {
    if (res.isGuidedAssistance) {
      this._wrongCount = 0;
      this._messages.update(msgs => [
        ...msgs,
        { role: 'assistant', content: res.message, isGuided: true },
      ]);
      return;
    }

    this._messages.update(msgs => [
      ...msgs,
      { role: 'assistant', content: res.message },
    ]);

    if (!res.correct) {
      this._wrongCount++;
      if (res.hint) {
        this._messages.update(msgs => [
          ...msgs,
          { role: 'assistant', content: `💡 ${res.hint}`, isHint: true },
        ]);
      }
      return;
    }

    this._wrongCount = 0;

    if (res.nextStep) {
      this._currentStep.set(res.nextStep.stepNumber);
      this._messages.update(msgs => [
        ...msgs,
        { role: 'assistant', content: res.nextStep!.question },
      ]);
    }

    if (res.studentNote)        this._studentNote.set(res.studentNote);
    if (res.parentSummary)      this._parentSummary.set(res.parentSummary);
    if (res.learningReflection) this._reflection.set(res.learningReflection);
    if (res.studentFeedback)    this._studentFeedback.set(res.studentFeedback);
    if (res.parentCoachingTips) this._parentCoaching.set(res.parentCoachingTips);
    if (!res.nextStep)          this._finished.set(true);
  }

  init(): void {
    this.selectScenario(SCENARIOS[0].id);
  }
}
