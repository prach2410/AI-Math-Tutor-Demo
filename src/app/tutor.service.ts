import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AssistResponse, AssistType, InteractionMode,
  EvaluateRequest, EvaluateResponse, StartResponse,
  SessionMessage, SessionEvent, CreateSessionRequest,
  CompleteSessionRequest, ParentFeedbackRequest, ReflectionRequest
} from './models/learning.model';
import { StudentProfileService } from './student-profile/student-profile.service';
import { DeviceService } from './device/device.service';

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
  private http           = inject(HttpClient);
  private studentProfile = inject(StudentProfileService);
  private device         = inject(DeviceService);

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
  private _phase             = signal<'awaiting-readiness' | 'questioning'>('questioning');
  private _passiveGrill      = signal<string | null>(null);
  private _pendingQuestion   = signal<string | null>(null);
  private _wrongCount        = 0;
  private _hintCount         = 0;
  private _guidedCount       = 0;
  private _exampleCount      = 0;
  private _voiceMessageCount = 0;
  private _textMessageCount  = 0;

  // Session tracking
  private _sessionId            = signal('');
  private _sessionStartedAt     = signal<Date | null>(null);
  private _sessionEvents: SessionEvent[] = [];
  private _sessionMessages: SessionMessage[] = [];
  private _parentFeedbackSubmitted = signal(false);
  private _interactionMode  = signal<InteractionMode | null>(null);
  private _reasonForChoice  = signal('');
  private _inFreeTalk           = signal(false);
  private _inProjectBrainMode   = signal(false);
  private _pendingTechniqueFeedback = signal<{ techniqueType: string; step: number } | null>(null);
  private _inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  private _abandonListener: (() => void) | null = null;
  private static readonly INACTIVE_MS = 3 * 60 * 1000;

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
  readonly phase           = this._phase.asReadonly();
  readonly scenarios       = SCENARIOS;
  readonly sessionId       = this._sessionId.asReadonly();
  readonly parentFeedbackSubmitted = this._parentFeedbackSubmitted.asReadonly();
  readonly interactionMode  = this._interactionMode.asReadonly();
  readonly reasonForChoice  = this._reasonForChoice.asReadonly();
  readonly inFreeTalk              = this._inFreeTalk.asReadonly();
  readonly inProjectBrainMode      = this._inProjectBrainMode.asReadonly();
  readonly pendingTechniqueFeedback = this._pendingTechniqueFeedback.asReadonly();

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
    this._pendingTechniqueFeedback.set(null);
    this._phase.set('questioning');
    this._passiveGrill.set(null);
    this._pendingQuestion.set(null);
    this._wrongCount        = 0;
    this._hintCount         = 0;
    this._guidedCount       = 0;
    this._exampleCount      = 0;
    this._voiceMessageCount = 0;
    this._textMessageCount  = 0;
    this._loading.set(true);

    // Reset session state
    const newSessionId = crypto.randomUUID();
    const now = new Date();
    this._sessionId.set(newSessionId);
    this._sessionStartedAt.set(now);
    this._sessionEvents = [];
    this._sessionMessages = [];
    this._parentFeedbackSubmitted.set(false);
    this._interactionMode.set(null);
    this._reasonForChoice.set('');
    this.addEvent('lesson_started');

    // Create session on server (fire-and-forget, don't block lesson)
    this.createSession(newSessionId, meta.title, now).catch(() => {});

    // Inactivity + abandon tracking
    this.resetInactivityTimer();
    this.registerAbandonListener();

    try {
      const name = this.studentProfile.displayName();
      const nameParam = name ? `?name=${encodeURIComponent(name)}` : '';
      const res = await firstValueFrom(
        this.http.get<StartResponse>(`${API}/start/${id}${nameParam}`)
      );
      this._currentStep.set(res.stepNumber);
      this._totalSteps.set(res.totalSteps);
      this._realWorldUses.set(res.realWorldUses);
      this.addEvent('step_started');
      if (res.passiveGrill) {
        this._passiveGrill.set(res.passiveGrill);
        this._pendingQuestion.set(res.question);
        const pgMsg: Message = { role: 'assistant', content: `${res.passiveGrill}\n\nน้องพอเริ่มเห็นภาพไหมครับ 😊` };
        this._messages.set([pgMsg]);
        this.addSessionMessage(pgMsg);
        this._phase.set('awaiting-readiness');
      } else {
        this._phase.set('questioning');
        this._passiveGrill.set(null);
        const q: Message = { role: 'assistant', content: res.question };
        this._messages.set([q]);
        this.addSessionMessage(q);
      }
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

    const inputMode = this._interactionMode() ?? 'text';
    if (inputMode === 'voice') {
      this._voiceMessageCount++;
      this.addEvent('voice_used');
    } else {
      this._textMessageCount++;
    }
    const userMsg: Message = { role: 'user', content: text };
    this._messages.update(msgs => [...msgs, userMsg]);
    this.addSessionMessage(userMsg, undefined, inputMode);
    this.addEvent('student_answer_submitted');
    this.autoSkipTechniqueFeedback();
    if (this.isFollowUpQuestion(text)) {
      this.addEvent(`student_follow_up_question:${text.trim()}`);
    }
    this.resetInactivityTimer();
    this._loading.set(true);

    const body: EvaluateRequest = {
      scenarioId: this._scenario().id,
      stepNumber: this._currentStep(),
      answer: text,
      wrongCount: this._wrongCount,
      hintCount: this._hintCount,
      guidedCount: this._guidedCount,
      studentName: this.studentProfile.displayName() || undefined,
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
    this.resetInactivityTimer();

    try {
      const name = this.studentProfile.displayName();
      const nameParam = name ? `?name=${encodeURIComponent(name)}` : '';
      const res = await firstValueFrom(
        this.http.get<AssistResponse>(
          `${API}/assist/${this._scenario().id}/${this._currentStep()}/${type}${nameParam}`
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

  submitReadiness(level: 'confused' | 'starting' | 'ready'): void {
    this.addEvent(`readiness_check:${level}`);
    if (level === 'confused') {
      const userMsg: Message = { role: 'user', content: '😕 ยังงงอยู่' };
      this._messages.update(msgs => [...msgs, userMsg]);
      this.addSessionMessage(userMsg);
      const pg = this._passiveGrill();
      const aiContent = (pg
        ? `ไม่เป็นไรนะครับ ลองดูอีกทีนะ 😊\n\n${pg}`
        : 'ไม่เป็นไรนะครับ ลองดูอีกทีนะ 😊'
      ) + '\n\nน้องพอเริ่มเห็นภาพไหมครับ 😊';
      const aiMsg: Message = { role: 'assistant', content: aiContent };
      this._messages.update(msgs => [...msgs, aiMsg]);
      this.addSessionMessage(aiMsg);
    } else {
      const label = level === 'starting' ? '🙂 เริ่มเห็นภาพแล้ว' : '😄 เห็นภาพแล้ว';
      const userMsg: Message = { role: 'user', content: label };
      this._messages.update(msgs => [...msgs, userMsg]);
      this.addSessionMessage(userMsg);
      const q = this._pendingQuestion();
      if (q) {
        this._phase.set('questioning');
        this._passiveGrill.set(null);
        const nextMsg: Message = { role: 'assistant', content: q };
        this._messages.update(msgs => [...msgs, nextMsg]);
        this.addSessionMessage(nextMsg);
        this._pendingQuestion.set(null);
      }
    }
  }

  setInteractionMode(mode: InteractionMode, reason = ''): void {
    this._interactionMode.set(mode);
    this._reasonForChoice.set(reason);
    this.addEvent(`mode_selected_${mode}`);
  }

  logEvent(type: string): void {
    this.addEvent(type);
  }

  submitTechniqueFeedback(feedback: 'like' | 'confused'): void {
    const pending = this._pendingTechniqueFeedback();
    if (!pending) return;
    this.addEvent(`technique_feedback:${pending.techniqueType}:${feedback}`);
    this._pendingTechniqueFeedback.set(null);
  }

  private autoSkipTechniqueFeedback(): void {
    const pending = this._pendingTechniqueFeedback();
    if (!pending) return;
    this.addEvent(`technique_feedback:${pending.techniqueType}:skipped`);
    this._pendingTechniqueFeedback.set(null);
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

  async submitReflection(req: ReflectionRequest): Promise<void> {
    const sessionId = this._sessionId();
    if (!sessionId) return;
    try {
      await firstValueFrom(
        this.http.post(`${SESSION_API}/${sessionId}/reflection`, req)
      );
    } catch {
      // silent fail — reflection data is in event log
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

    if (!res.correct) {
      this._wrongCount++;
      const msg: Message = { role: 'assistant', content: res.message };
      this._messages.update(msgs => [...msgs, msg]);
      this.addSessionMessage(msg);
      if (res.hint) {
        const hintMsg: Message = { role: 'assistant', content: `💡 ${res.hint}`, isHint: true };
        this._messages.update(msgs => [...msgs, hintMsg]);
        this.addSessionMessage(hintMsg, 'hint');
      }
      return;
    }

    this._wrongCount = 0;

    if (res.teachingMomentType) {
      this.addEvent(`teaching_moment_shown:${res.teachingMomentType}`);
      this._pendingTechniqueFeedback.set({ techniqueType: res.teachingMomentType, step: this._currentStep() });
    }

    if (res.nextStep) {
      this.addEvent('step_completed');
      this._currentStep.set(res.nextStep.stepNumber);
      this.addEvent('step_started');
      if (res.nextStep.passiveGrill) {
        this._passiveGrill.set(res.nextStep.passiveGrill);
        this._pendingQuestion.set(res.nextStep.question);
        const pgMsg: Message = { role: 'assistant', content: `${res.message}\n\n${res.nextStep.passiveGrill}\n\nน้องพอเริ่มเห็นภาพไหมครับ 😊` };
        this._messages.update(msgs => [...msgs, pgMsg]);
        this.addSessionMessage(pgMsg);
        this._phase.set('awaiting-readiness');
      } else {
        const msg: Message = { role: 'assistant', content: res.message };
        this._messages.update(msgs => [...msgs, msg]);
        this.addSessionMessage(msg);
        this._phase.set('questioning');
        this._passiveGrill.set(null);
        const nextMsg: Message = { role: 'assistant', content: res.nextStep.question };
        this._messages.update(msgs => [...msgs, nextMsg]);
        this.addSessionMessage(nextMsg);
      }
    } else {
      const msg: Message = { role: 'assistant', content: res.message };
      this._messages.update(msgs => [...msgs, msg]);
      this.addSessionMessage(msg);
    }

    if (res.studentNote)        this._studentNote.set(res.studentNote);
    if (res.parentSummary)      this._parentSummary.set(res.parentSummary);
    if (res.learningReflection) this._reflection.set(res.learningReflection);
    if (res.studentFeedback)    this._studentFeedback.set(res.studentFeedback);
    if (res.parentCoachingTips) this._parentCoaching.set(res.parentCoachingTips);

    if (!res.nextStep) {
      this.addEvent('step_completed');
      this._finished.set(true);
      this.addEvent('lesson_completed');
      this.clearAbandonListener();
      this.completeSession().catch(() => {});
    }
  }

  init(): void {
    this._inFreeTalk.set(false);
    this.selectScenario(SCENARIOS[0].id);
  }

  enterFreeTalk(): void {
    this._inFreeTalk.set(true);
    this.addEvent('FreeTalkStarted');
  }

  trackFreeTalkDuringLesson(): void {
    this.addEvent('FreeTalkEnteredDuringLesson');
  }

  enterProjectBrainMode(): void {
    this._cancelEmptySession();
    this._inProjectBrainMode.set(true);
    this.addEvent('project_brain_entered');
  }

  private _cancelEmptySession(): void {
    const sessionId = this._sessionId();
    // Only cancel if session exists and no student messages were sent
    const hasStudentMessages = this._sessionMessages.some(m => m.role === 'student');
    if (!sessionId || hasStudentMessages) return;
    this.http.delete(`${SESSION_API}/${sessionId}`).subscribe({ error: () => {} });
    this._sessionId.set('');
    this._sessionEvents = [];
    this._sessionMessages = [];
  }

  exitProjectBrainMode(): void {
    this._inProjectBrainMode.set(false);
    this.addEvent('project_brain_exited');
  }

  addProjectBrainEvent(type: string): void {
    this.addEvent(type);
  }

  exitFreeTalk(): void {
    const wasInLesson = this._messages().length > 0;
    this._inFreeTalk.set(false);
    this.addEvent(wasInLesson ? 'FreeTalkReturnedToLesson' : 'FreeTalkEnded');
    if (!wasInLesson) {
      this.selectScenario(SCENARIOS[0].id);
    }
  }

  private isFollowUpQuestion(text: string): boolean {
    const t = text.trim();
    if (t.endsWith('?') || t.endsWith('？')) return true;
    const patterns = ['ทำไม', 'อธิบาย', 'หมายความ', 'แบบอื่น', 'อีกวิธี', 'ยังไง', 'แบบไหน', 'ได้ไหม', 'ใช่ไหม', 'เพราะ', 'คืออะไร', 'what if', 'why', 'how'];
    return patterns.some(p => t.toLowerCase().includes(p));
  }

  private addEvent(type: string): void {
    this._sessionEvents.push({ type, timestamp: new Date().toISOString() });
  }

  private addSessionMessage(
    msg: Message,
    typeOverride?: 'answer' | 'message' | 'hint' | 'guided' | 'worked_example' | 'error',
    inputMode?: 'voice' | 'text'
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
    const entry: SessionMessage = { role, type, text: msg.content, timestamp: new Date().toISOString() };
    if (inputMode) entry.inputMode = inputMode;
    this._sessionMessages.push(entry);
  }

  private async createSession(sessionId: string, topic: string, startedAt: Date): Promise<void> {
    const req: CreateSessionRequest = {
      sessionId,
      topic,
      studentAlias: 'Student-001',
      startedAt: startedAt.toISOString(),
      studentId:   this.studentProfile.studentId(),
      deviceId:    this.device.deviceId(),
      displayName: this.studentProfile.displayName() || undefined,
    };
    await firstValueFrom(this.http.post(SESSION_API, req));
  }

  private resetInactivityTimer(): void {
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
    if (this._finished()) return;
    this._inactivityTimer = setTimeout(() => {
      this.addEvent('session_inactive');
    }, TutorService.INACTIVE_MS);
  }

  private registerAbandonListener(): void {
    this.clearAbandonListener();
    this._abandonListener = () => {
      if (this._finished()) return;
      this.addEvent('session_abandoned');
      const sessionId = this._sessionId();
      if (!sessionId) return;
      const startedAt = this._sessionStartedAt();
      const now = new Date();
      const durationSeconds = startedAt
        ? Math.round((now.getTime() - startedAt.getTime()) / 1000)
        : 0;
      const payload = JSON.stringify({
        completedAt: now.toISOString(),
        messages: this._sessionMessages,
        events: this._sessionEvents,
        summary: {
          hintUsed: this._hintCount,
          helpMeStartUsed: this._guidedCount,
          exampleUsed: this._exampleCount,
          completed: false,
          durationSeconds,
          voiceMessages: this._voiceMessageCount,
          textMessages: this._textMessageCount,
        },
        interactionMode: this._interactionMode() ?? undefined,
        reasonForChoice: this._reasonForChoice() || undefined,
      });
      navigator.sendBeacon(`${SESSION_API}/${sessionId}/complete`, new Blob([payload], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', this._abandonListener);
  }

  private clearAbandonListener(): void {
    if (this._abandonListener) {
      window.removeEventListener('beforeunload', this._abandonListener);
      this._abandonListener = null;
    }
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
        voiceMessages: this._voiceMessageCount,
        textMessages: this._textMessageCount,
      },
      interactionMode: this._interactionMode() ?? undefined,
      reasonForChoice: this._reasonForChoice() || undefined,
    };

    await firstValueFrom(
      this.http.post(`${SESSION_API}/${sessionId}/complete`, req)
    );
  }
}
