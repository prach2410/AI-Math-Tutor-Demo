import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TeachingStep {
  step: number;
  goal: string;
  guidingQuestion: string;
  conceptHint: string;
}

export interface StartTeachingResponse {
  sessionId: string;
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

@Injectable({ providedIn: 'root' })
export class TeachingService {
  private http = inject(HttpClient);

  start(problemText: string, latex: string, topic: string, hasFigure: boolean): Promise<StartTeachingResponse> {
    return firstValueFrom(
      this.http.post<StartTeachingResponse>('/api/teaching/start', { problemText, latex, topic, hasFigure })
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
}
