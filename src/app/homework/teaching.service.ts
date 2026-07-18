import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StudentProfileService } from '../student-profile/student-profile.service';
import { DeviceService } from '../device/device.service';

export interface TeachingStep {
  step: number;
  goal: string;
  guidingQuestion: string;
  conceptHint: string;
}

export interface StartTeachingResponse {
  sessionId: string;
  needsConfirm: boolean;
  figureDescription: string;
  currentStep: TeachingStep | null;
  totalSteps: number;
}

export interface ConfirmFigureResponse {
  currentStep: TeachingStep;
  totalSteps: number;
}

export interface AnswerResponse {
  verdict: 'correct' | 'partial' | 'wrong';
  reason: string;
  missing: string;
  encouragement: string;
  nextStep: TeachingStep | null;
  done: boolean;
}

export interface HintResponse {
  level: number;
  help: string;
}

export interface NotesResponse {
  studentNotes: string;
  parentSummary: string;
}

export interface SolveResponse {
  sessionId: string;
  solutionSteps: string[];
  understandingStep: string;
  keyStepIndices: number[];
}

export interface ExplainResponse {
  explanation: string;
}

export interface RecallResponse {
  show: boolean;
  recallQuestion: string;
}

@Injectable({ providedIn: 'root' })
export class TeachingService {
  private http           = inject(HttpClient);
  private studentProfile = inject(StudentProfileService);
  private device         = inject(DeviceService);

  start(problemText: string, latex: string, topic: string, hasFigure: boolean,
        visionModel = '', analysisStartedAt = '', analysisEndedAt = ''): Promise<StartTeachingResponse> {
    const studentName = this.studentProfile.displayName();
    const studentId   = this.studentProfile.studentId();
    const deviceId    = this.device.deviceId();
    return firstValueFrom(
      this.http.post<StartTeachingResponse>('/api/teaching/start',
        { problemText, latex, topic, hasFigure, visionModel, analysisStartedAt, analysisEndedAt, studentName, studentId, deviceId })
    );
  }

  answer(sessionId: string, answer: string): Promise<AnswerResponse> {
    return firstValueFrom(
      this.http.post<AnswerResponse>(`/api/teaching/${sessionId}/answer`, { answer })
    );
  }

  hint(sessionId: string, level: number): Promise<HintResponse> {
    return firstValueFrom(
      this.http.post<HintResponse>(`/api/teaching/${sessionId}/hint`, { level })
    );
  }

  confirmFigure(sessionId: string, studentNote: string): Promise<ConfirmFigureResponse> {
    return firstValueFrom(
      this.http.post<ConfirmFigureResponse>(`/api/teaching/${sessionId}/confirm-figure`, { studentNote })
    );
  }

  notes(sessionId: string): Promise<NotesResponse> {
    return firstValueFrom(
      this.http.get<NotesResponse>(`/api/teaching/${sessionId}/notes`)
    );
  }

  solve(problemText: string, latex: string, topic: string,
        visionModel = '', analysisStartedAt = '', analysisEndedAt = ''): Promise<SolveResponse> {
    const studentName = this.studentProfile.displayName();
    const studentId   = this.studentProfile.studentId();
    const deviceId    = this.device.deviceId();
    return firstValueFrom(
      this.http.post<SolveResponse>('/api/teaching/solve',
        { problemText, latex, topic, visionModel, analysisStartedAt, analysisEndedAt, studentName, studentId, deviceId })
    );
  }

  explain(problemText: string, topic: string, stepText: string, fullSolution: string): Promise<ExplainResponse> {
    return firstValueFrom(
      this.http.post<ExplainResponse>('/api/teaching/explain',
        { problemText, topic, stepText, fullSolution })
    );
  }

  recall(topic: string): Promise<RecallResponse> {
    const studentId = this.studentProfile.studentId();
    const deviceId  = this.device.deviceId();
    const params = new URLSearchParams({ studentId, deviceId, topic });
    return firstValueFrom(
      this.http.get<RecallResponse>(`/api/teaching/recall?${params.toString()}`)
    );
  }

  recallAnswer(recallQuestion: string, answer: string, topic: string): Promise<{ feedback: string }> {
    return firstValueFrom(
      this.http.post<{ feedback: string }>('/api/teaching/recall-answer',
        { recallQuestion, answer, topic })
    );
  }
}
